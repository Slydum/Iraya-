import { TileFlag, TOOL_LABELS, TOOL_ORDER, type Tool } from "./types";
import type { CropStage } from "../modern-farm/ModernFarmRuntime";

const STORAGE_KEY = "iraya.phaser.farm.v1";
const GROWTH_STEP_MS = 4_000;

type StoredFarm = {
  selectedTool?: Tool;
  cells?: Record<string, number>;
  plantedAt?: Record<string, number>;
  wateredAt?: Record<string, number>;
};

export class FarmState {
  selectedTool: Tool = "hoe";
  feedback = "Choose a tool and work the field.";
  readonly cells = new Map<string, number>();
  private readonly plantedAt = new Map<string, number>();
  private readonly wateredAt = new Map<string, number>();

  constructor() {
    this.load();
  }

  cycleTool(direction: number): void {
    const index = TOOL_ORDER.indexOf(this.selectedTool);
    const next = (index + direction + TOOL_ORDER.length) % TOOL_ORDER.length;
    this.selectTool(TOOL_ORDER[next] ?? "hoe");
  }

  selectTool(tool: Tool): void {
    if (this.selectedTool === tool) return;
    this.selectedTool = tool;
    this.feedback = `Selected ${TOOL_LABELS[tool]}.`;
    this.save();
  }

  interact(column: number, row: number): boolean {
    const key = `${column},${row}`;
    let state = this.cells.get(key) ?? 0;
    let changed = false;
    const now = Date.now();

    switch (this.selectedTool) {
      case "hand": {
        if ((state & TileFlag.Seeded) === 0) {
          this.feedback = "Nothing to harvest here yet.";
        } else if (this.cropStageForKey(key, state, now) !== "ripe") {
          this.feedback = "The carrots are still growing.";
        } else {
          state &= ~TileFlag.Seeded;
          state &= ~TileFlag.Watered;
          this.plantedAt.delete(key);
          this.wateredAt.delete(key);
          changed = true;
          this.feedback = "Carrot harvested.";
        }
        break;
      }
      case "hoe":
        if ((state & TileFlag.Tilled) !== 0) this.feedback = "That tile is already tilled.";
        else {
          state |= TileFlag.Tilled;
          changed = true;
          this.feedback = "Soil tilled.";
        }
        break;
      case "seeds":
        if ((state & TileFlag.Tilled) === 0) this.feedback = "Till the soil before planting.";
        else if ((state & TileFlag.Seeded) !== 0) this.feedback = "Seeds are already planted here.";
        else {
          state |= TileFlag.Seeded;
          this.plantedAt.set(key, now);
          if ((state & TileFlag.Watered) !== 0) this.wateredAt.set(key, now);
          changed = true;
          this.feedback = "Carrot seeds planted.";
        }
        break;
      case "watering-can":
        if ((state & TileFlag.Tilled) === 0) this.feedback = "Water only stays on tilled soil.";
        else if ((state & TileFlag.Watered) !== 0) this.feedback = "That tile is already watered.";
        else {
          state |= TileFlag.Watered;
          this.wateredAt.set(key, now);
          changed = true;
          this.feedback = "Soil watered. The carrots will grow soon.";
        }
        break;
    }

    if (changed) this.cells.set(key, state);
    this.save();
    return changed;
  }

  cropStage(column: number, row: number, now = Date.now()): CropStage | null {
    const key = `${column},${row}`;
    const state = this.cells.get(key) ?? 0;
    if ((state & TileFlag.Seeded) === 0) return null;
    return this.cropStageForKey(key, state, now);
  }

  counts(): { tilled: number; planted: number; watered: number } {
    let tilled = 0;
    let planted = 0;
    let watered = 0;
    for (const state of this.cells.values()) {
      if ((state & TileFlag.Tilled) !== 0) tilled += 1;
      if ((state & TileFlag.Seeded) !== 0) planted += 1;
      if ((state & TileFlag.Watered) !== 0) watered += 1;
    }
    return { tilled, planted, watered };
  }

  private cropStageForKey(key: string, state: number, now: number): CropStage {
    if ((state & TileFlag.Watered) === 0) return "seed";
    const wateredAt = this.wateredAt.get(key) ?? now;
    const elapsed = Math.max(0, now - wateredAt);
    if (elapsed < GROWTH_STEP_MS) return "stage-1";
    if (elapsed < GROWTH_STEP_MS * 2) return "sprout";
    return "ripe";
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        selectedTool: this.selectedTool,
        cells: Object.fromEntries(this.cells.entries()),
        plantedAt: Object.fromEntries(this.plantedAt.entries()),
        wateredAt: Object.fromEntries(this.wateredAt.entries()),
      }));
    } catch {
      // Gameplay remains available when storage is blocked by the browser.
    }
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const stored = JSON.parse(raw) as StoredFarm;
      if (stored.selectedTool && TOOL_ORDER.includes(stored.selectedTool)) this.selectedTool = stored.selectedTool;
      for (const [key, value] of Object.entries(stored.cells ?? {})) {
        if (Number.isInteger(value)) this.cells.set(key, value);
      }
      for (const [key, value] of Object.entries(stored.plantedAt ?? {})) {
        if (Number.isFinite(value)) this.plantedAt.set(key, value);
      }
      for (const [key, value] of Object.entries(stored.wateredAt ?? {})) {
        if (Number.isFinite(value)) this.wateredAt.set(key, value);
      }

      const now = Date.now();
      for (const [key, state] of this.cells.entries()) {
        if ((state & TileFlag.Seeded) !== 0 && !this.plantedAt.has(key)) this.plantedAt.set(key, now);
        if ((state & TileFlag.Watered) !== 0 && !this.wateredAt.has(key)) this.wateredAt.set(key, now);
      }
    } catch {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore storage errors in private or restricted browsing modes.
      }
    }
  }
}
