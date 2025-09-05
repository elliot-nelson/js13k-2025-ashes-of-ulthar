// Constants

// The game's desired dimensions in pixels - the actual dimensions can be adjusted
// slightly by the Viewport module.
export const TARGET_GAME_WIDTH = 320;
export const TARGET_GAME_HEIGHT = 180;

// Shortcuts for marker locations on screen
export const INVENTORY_WOOD_POS = { u: 250, v: 131 };
export const INVENTORY_MEAT_POS = { u: 250, v: 143 };
export const INVENTORY_TORCH_POS = { u: 250, v: 155 };
export const INVENTORY_STONE_POS = { u: 250, v: 167 };
export const SANITY_POS = { u: 284, v: 9 };

// Number of "facing left" villager frames (doubled for facing right)
export const VILLAGER_FRAMES = 12;

// Frames per second (locked)
//
// Other constants below, like gravity, foot speed, etc., are represented as movement PER FRAME.
export const FPS = 42;

export const PALETTE = [
  '#0a1a2f',
  '#04373b',
  '#1a644c',
  '#40985c',
  '#d1cb95'
];
