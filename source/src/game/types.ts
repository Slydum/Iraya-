export type Direction = "down" | "up" | "left" | "right";
export type Tool = "hand" | "hoe" | "seeds" | "watering-can";

export const TOOL_ORDER: readonly Tool[] = ["hand", "hoe", "seeds", "watering-can"];

export const TOOL_LABELS: Record<Tool, string> = {
  hand: "Hand",
  hoe: "Hoe",
  seeds: "Seeds",
  "watering-can": "Watering Can",
};

export const TileFlag = {
  Tilled: 1,
  Seeded: 2,
  Watered: 4,
} as const;
