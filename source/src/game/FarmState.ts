import { TileFlag, TOOL_LABELS, TOOL_ORDER, type Tool } from "./types";

const STORAGE_KEY = "iraya.phaser.farm.v1";

type StoredFarm = {
  selectedTool?: Tool;
  cells?: Record<string, number>;
};

export class FarmState {
  selectedTool: Tool = "hoe";
  feedback = "Choose a tool and work the field.";
  readonly cells = new Map<string, number>();

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

    switch (this.selectedTool) {
      case "hand":
        if ((state & TileFlag.Seeded) !== 0) {
          this.feedback = `This planted tile is ${(state & TileFlag.Watered) !== 0 ? "watered" : "dry"}.`;
        } else {
          this.feedback = "Nothing to pick up here yet.";
        }
        break;
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
          changed = true;
          this.feedback = "Seeds planted.";
        }
        break;
      case "watering-can":
        if ((state & TileFlag.Tilled) === 0) this.feedback = "Water only stays on tilled soil.";
        else if ((state & TileFlag.Watered) !== 0) this.feedback = "That tile is already watered.";
        else {
          state |= TileFlag.Watered;
          changed = true;
          this.feedback = "Soil watered.";
        }
        break;
    }

    if (changed) this.cells.set(key, state);
    this.save();
    return changed;
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

  private save(): void {
    try {
      const cells = Object.fromEntries(this.cells.entries());
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ selectedTool: this.selectedTool, cells }));
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
    } catch {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore storage errors in private or restricted browsing modes.
      }
    }
  }
}
