import Phaser from "phaser";
import type { Direction, Tool } from "../game/types";

export type FarmerAction = "idle" | "walk" | "dig" | "watering" | "harvest";
export type CropStage = "seed" | "stage-1" | "sprout" | "ripe";

type FarmerAnimation = {
  frameCount: number;
  frameRate: number;
  repeat: number;
};

const CACHE_VERSION = "mf-iraya-1";
const DIRECTIONS: readonly Direction[] = ["down", "up", "left", "right"];

const FARMER_ANIMATIONS: Record<FarmerAction, FarmerAnimation> = {
  idle: { frameCount: 1, frameRate: 1, repeat: 0 },
  walk: { frameCount: 6, frameRate: 8.3, repeat: -1 },
  dig: { frameCount: 9, frameRate: 12, repeat: 0 },
  watering: { frameCount: 14, frameRate: 12, repeat: 0 },
  harvest: { frameCount: 9, frameRate: 12, repeat: 0 },
};

export const ModernFarmAtlasKey = "modern-farm:iraya-atlas";

export function farmerFrameName(action: FarmerAction, direction: Direction, frame = 0): string {
  return `farmer/${action}/${direction}/${frame}`;
}

export function farmerAnimationKey(action: FarmerAction, direction: Direction): string {
  return `modern-farm:farmer-1:${action}:${direction}`;
}

export function cropFrameName(stage: CropStage): string {
  return `farm/carrot-${stage}`;
}

export function soilFrameName(watered: boolean): string {
  return watered ? "farm/soil-wet" : "farm/soil-dry";
}

export function loadModernFarmRuntime(scene: Phaser.Scene): void {
  const base = `${import.meta.env.BASE_URL}assets/modern-farm/`;
  scene.load.atlas(
    ModernFarmAtlasKey,
    `${base}iraya-modern-farm.webp?v=${CACHE_VERSION}`,
    `${base}iraya-modern-farm.json?v=${CACHE_VERSION}`,
  );
}

export function registerModernFarmAnimations(scene: Phaser.Scene): void {
  for (const action of Object.keys(FARMER_ANIMATIONS) as FarmerAction[]) {
    const definition = FARMER_ANIMATIONS[action];
    for (const direction of DIRECTIONS) {
      const key = farmerAnimationKey(action, direction);
      if (scene.anims.exists(key)) continue;
      scene.anims.create({
        key,
        frames: Array.from({ length: definition.frameCount }, (_, frame) => ({
          key: ModernFarmAtlasKey,
          frame: farmerFrameName(action, direction, frame),
        })),
        frameRate: definition.frameRate,
        repeat: definition.repeat,
      });
    }
  }
}

export function farmerToolAction(tool: Tool): FarmerAction {
  switch (tool) {
    case "hoe": return "dig";
    case "watering-can": return "watering";
    case "hand":
    case "seeds":
      return "harvest";
  }
}

export function farmerActionDurationMs(action: FarmerAction): number {
  const definition = FARMER_ANIMATIONS[action];
  return Math.ceil((definition.frameCount / definition.frameRate) * 1000);
}
