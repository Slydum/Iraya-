export const WORLD_WIDTH = 960;
export const WORLD_HEIGHT = 640;
export const CELL_SIZE = 16;

export const PLOT = {
  x: 272,
  y: 224,
  columns: 16,
  rows: 11,
} as const;

export const PLAYER_START = { x: 480, y: 450 } as const;

export const COLLISIONS = {
  house: { x: 90, y: 54, width: 124, height: 148 },
  pond: { x: 678, y: 326, width: 244, height: 116 },
  trees: [
    [70, 130], [310, 120], [385, 118], [875, 135], [900, 230],
    [78, 575], [145, 590], [790, 590], [875, 570],
  ],
  smallTrees: [[340, 560], [650, 570], [610, 120]],
  stumps: [[585, 250], [225, 455]],
} as const;
