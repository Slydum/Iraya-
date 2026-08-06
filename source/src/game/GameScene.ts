import Phaser from "phaser";
import { CELL_SIZE, COLLISIONS, PLAYER_START, PLOT, WORLD_HEIGHT, WORLD_WIDTH } from "./constants";
import { FarmState } from "./FarmState";
import { inputBridge } from "./InputBridge";
import { updateHud } from "./HudBridge";
import { TileFlag, TOOL_LABELS, type Direction, type Tool } from "./types";
import {
  ModernFarmAtlasKey,
  cropFrameName,
  farmerActionDurationMs,
  farmerAnimationKey,
  farmerFrameName,
  farmerToolAction,
  loadModernFarmRuntime,
  registerModernFarmAnimations,
  soilFrameName,
} from "../modern-farm/ModernFarmRuntime";

type GameKeys = {
  w: Phaser.Input.Keyboard.Key;
  a: Phaser.Input.Keyboard.Key;
  s: Phaser.Input.Keyboard.Key;
  d: Phaser.Input.Keyboard.Key;
  shift: Phaser.Input.Keyboard.Key;
  q: Phaser.Input.Keyboard.Key;
  e: Phaser.Input.Keyboard.Key;
  one: Phaser.Input.Keyboard.Key;
  two: Phaser.Input.Keyboard.Key;
  three: Phaser.Input.Keyboard.Key;
  four: Phaser.Input.Keyboard.Key;
  f: Phaser.Input.Keyboard.Key;
  space: Phaser.Input.Keyboard.Key;
  enter: Phaser.Input.Keyboard.Key;
};

const WALK_SPEED = 92;
const SPRINT_MULTIPLIER = 1.55;
const FARM_REFRESH_MS = 500;

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: GameKeys;
  private obstacles!: Phaser.Physics.Arcade.StaticGroup;
  private farmTiles!: Phaser.GameObjects.Group;
  private cursorGraphics!: Phaser.GameObjects.Graphics;
  private readonly farm = new FarmState();
  private facing: Direction = "down";
  private toolLockedUntil = 0;
  private actionPlaying = false;
  private nextFarmRefreshAt = 0;
  private targetCell: { column: number; row: number; x: number; y: number; valid: boolean } = {
    column: -1,
    row: -1,
    x: 0,
    y: 0,
    valid: false,
  };
  private unsubscribeTouch?: () => void;

  constructor() {
    super("game");
  }

  preload(): void {
    const base = import.meta.env.BASE_URL;
    this.load.image("farm-world", `${base}assets/farm_world.webp?v=8e20d0c4`);
    loadModernFarmRuntime(this);
  }

  create(): void {
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.add.image(0, 0, "farm-world").setOrigin(0, 0).setDepth(0);

    this.obstacles = this.physics.add.staticGroup();
    this.createCollisions();
    registerModernFarmAnimations(this);

    this.farmTiles = this.add.group();
    this.cursorGraphics = this.add.graphics().setDepth(20);

    this.player = this.physics.add.sprite(
      PLAYER_START.x,
      PLAYER_START.y,
      ModernFarmAtlasKey,
      farmerFrameName("idle", "down"),
    );
    this.player.setOrigin(0.5, 1).setDepth(10).setCollideWorldBounds(true);
    this.alignPlayerBody();

    this.physics.add.collider(this.player, this.obstacles);

    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.14, 0.14);
    this.cameras.main.setRoundPixels(true);
    this.scale.on(Phaser.Scale.Events.RESIZE, this.resizeCamera, this);
    this.resizeCamera(this.scale.gameSize);

    if (!this.input.keyboard) throw new Error("Keyboard input is unavailable.");
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      shift: Phaser.Input.Keyboard.KeyCodes.SHIFT,
      q: Phaser.Input.Keyboard.KeyCodes.Q,
      e: Phaser.Input.Keyboard.KeyCodes.E,
      one: Phaser.Input.Keyboard.KeyCodes.ONE,
      two: Phaser.Input.Keyboard.KeyCodes.TWO,
      three: Phaser.Input.Keyboard.KeyCodes.THREE,
      four: Phaser.Input.Keyboard.KeyCodes.FOUR,
      f: Phaser.Input.Keyboard.KeyCodes.F,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      enter: Phaser.Input.Keyboard.KeyCodes.ENTER,
    }) as GameKeys;

    this.unsubscribeTouch = inputBridge.subscribe((action) => {
      if (action === "tool-prev") this.farm.cycleTool(-1);
      if (action === "tool-next") this.farm.cycleTool(1);
      if (action === "use") this.useTool();
      this.renderFarm();
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.unsubscribeTouch?.());
    this.renderFarm();
    this.updateTarget();
    this.updateHud();
  }

  update(time: number): void {
    this.handleDiscreteKeys();

    const locked = this.actionPlaying || time < this.toolLockedUntil;
    const left = this.cursors.left.isDown || this.keys.a.isDown || inputBridge.isHeld("left");
    const right = this.cursors.right.isDown || this.keys.d.isDown || inputBridge.isHeld("right");
    const up = this.cursors.up.isDown || this.keys.w.isDown || inputBridge.isHeld("up");
    const down = this.cursors.down.isDown || this.keys.s.isDown || inputBridge.isHeld("down");
    const sprinting = this.keys.shift.isDown || inputBridge.isHeld("run");

    let horizontal = Number(right) - Number(left);
    let vertical = Number(down) - Number(up);
    const length = Math.hypot(horizontal, vertical);
    if (length > 1) {
      horizontal /= length;
      vertical /= length;
    }

    if (locked) {
      horizontal = 0;
      vertical = 0;
    }

    const speed = WALK_SPEED * (sprinting ? SPRINT_MULTIPLIER : 1);
    this.player.setVelocity(horizontal * speed, vertical * speed);

    const moving = horizontal !== 0 || vertical !== 0;
    if (!locked && moving) {
      this.facing = this.directionFromVector(horizontal, vertical);
      const animation = farmerAnimationKey("walk", this.facing);
      if (this.player.anims.currentAnim?.key !== animation) this.player.play(animation, true);
      this.player.anims.timeScale = sprinting ? 1.45 : 1;
    } else if (!locked) {
      this.showIdle();
    }

    this.alignPlayerBody();
    this.updateTarget();
    this.updateHud();

    if (time >= this.nextFarmRefreshAt) {
      this.nextFarmRefreshAt = time + FARM_REFRESH_MS;
      this.renderFarm();
    }
  }

  private createCollisions(): void {
    const addRect = (x: number, y: number, width: number, height: number): void => {
      const obstacle = this.add.rectangle(x + width / 2, y + height / 2, width, height, 0x000000, 0);
      this.obstacles.add(obstacle);
    };

    addRect(COLLISIONS.house.x, COLLISIONS.house.y, COLLISIONS.house.width, COLLISIONS.house.height);
    addRect(COLLISIONS.pond.x, COLLISIONS.pond.y, COLLISIONS.pond.width, COLLISIONS.pond.height);

    for (const [x, y] of COLLISIONS.trees) addRect(x - 10, y - 18, 20, 20);
    for (const [x, y] of COLLISIONS.smallTrees) addRect(x - 7, y - 13, 14, 15);
    for (const [x, y] of COLLISIONS.stumps) addRect(x - 12, y - 14, 24, 16);
  }

  private handleDiscreteKeys(): void {
    if (Phaser.Input.Keyboard.JustDown(this.keys.q)) this.farm.cycleTool(-1);
    if (Phaser.Input.Keyboard.JustDown(this.keys.e)) this.farm.cycleTool(1);
    if (Phaser.Input.Keyboard.JustDown(this.keys.one)) this.farm.selectTool("hand");
    if (Phaser.Input.Keyboard.JustDown(this.keys.two)) this.farm.selectTool("hoe");
    if (Phaser.Input.Keyboard.JustDown(this.keys.three)) this.farm.selectTool("seeds");
    if (Phaser.Input.Keyboard.JustDown(this.keys.four)) this.farm.selectTool("watering-can");
    if (
      Phaser.Input.Keyboard.JustDown(this.keys.f) ||
      Phaser.Input.Keyboard.JustDown(this.keys.space) ||
      Phaser.Input.Keyboard.JustDown(this.keys.enter)
    ) this.useTool();
  }

  private useTool(): void {
    if (this.actionPlaying || this.time.now < this.toolLockedUntil) return;
    if (!this.targetCell.valid) {
      this.farm.feedback = "Face a tile inside the farm plot.";
      this.updateHud();
      return;
    }

    const tool = this.farm.selectedTool;
    const changed = this.farm.interact(this.targetCell.column, this.targetCell.row);
    if (changed) {
      this.player.setVelocity(0, 0);
      this.playToolAnimation(tool);
    }
    this.renderFarm();
    this.updateHud();
  }

  private playToolAnimation(tool: Tool): void {
    const action = farmerToolAction(tool);
    const animation = farmerAnimationKey(action, this.facing);
    const duration = farmerActionDurationMs(action);

    this.actionPlaying = true;
    this.toolLockedUntil = this.time.now + duration;
    this.player.anims.timeScale = 1;
    this.player.play(animation, true);
    this.player.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.actionPlaying = false;
      this.toolLockedUntil = 0;
      this.showIdle();
      this.alignPlayerBody();
    });
  }

  private showIdle(): void {
    const frame = farmerFrameName("idle", this.facing);
    if (this.player.texture.key === ModernFarmAtlasKey && this.player.frame.name === frame) return;
    this.player.anims.stop();
    this.player.setTexture(ModernFarmAtlasKey, frame);
    this.player.anims.timeScale = 1;
  }

  private alignPlayerBody(): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const frameWidth = this.player.frame.realWidth;
    const frameHeight = this.player.frame.realHeight;
    body.setSize(12, 18, false);
    body.setOffset(Math.floor((frameWidth - 12) / 2), Math.max(0, frameHeight - 18));
  }

  private updateTarget(): void {
    const cardinal = this.facingVector();
    const targetX = this.player.x + cardinal.x * 20;
    const targetY = this.player.y + cardinal.y * 20;
    const snappedX = Math.floor(targetX / CELL_SIZE) * CELL_SIZE;
    const snappedY = Math.floor(targetY / CELL_SIZE) * CELL_SIZE;
    const column = Math.floor((snappedX - PLOT.x) / CELL_SIZE);
    const row = Math.floor((snappedY - PLOT.y) / CELL_SIZE);
    const valid = column >= 0 && row >= 0 && column < PLOT.columns && row < PLOT.rows;

    this.targetCell = { column, row, x: snappedX, y: snappedY, valid };
    this.cursorGraphics.clear();
    const color = valid ? 0xfff3c4 : 0xd8665f;
    this.cursorGraphics.lineStyle(2, color, 1).strokeRect(snappedX + 1, snappedY + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    if (valid) {
      const centerX = snappedX + CELL_SIZE / 2;
      const centerY = snappedY + CELL_SIZE / 2;
      this.cursorGraphics.lineStyle(1, color, 1);
      this.cursorGraphics.lineBetween(centerX - 3, centerY, centerX + 3, centerY);
      this.cursorGraphics.lineBetween(centerX, centerY - 3, centerX, centerY + 3);
    }
  }

  private renderFarm(): void {
    this.farmTiles.clear(true, true);
    const now = Date.now();

    for (const [key, state] of this.farm.cells.entries()) {
      const parts = key.split(",").map(Number);
      const column = parts[0];
      const row = parts[1];
      if (column === undefined || row === undefined) continue;

      const x = PLOT.x + column * CELL_SIZE;
      const y = PLOT.y + row * CELL_SIZE;
      const centerX = x + CELL_SIZE / 2;
      const centerY = y + CELL_SIZE / 2;

      if ((state & TileFlag.Tilled) !== 0) {
        const soil = this.add.image(
          centerX,
          centerY,
          ModernFarmAtlasKey,
          soilFrameName((state & TileFlag.Watered) !== 0),
        ).setDepth(4);
        this.farmTiles.add(soil);
      }

      const cropStage = this.farm.cropStage(column, row, now);
      if (cropStage) {
        const crop = this.add.image(
          centerX,
          y + CELL_SIZE,
          ModernFarmAtlasKey,
          cropFrameName(cropStage),
        )
          .setOrigin(0.5, 1)
          .setDepth(6);
        this.farmTiles.add(crop);
      }
    }
  }

  private updateHud(): void {
    const counts = this.farm.counts();
    updateHud({
      x: this.player.x,
      y: this.player.y,
      tool: TOOL_LABELS[this.farm.selectedTool],
      target: this.targetCell.valid
        ? `Tile ${String(this.targetCell.column + 1).padStart(2, "0")}, ${String(this.targetCell.row + 1).padStart(2, "0")}`
        : "Outside plot",
      tilled: counts.tilled,
      planted: counts.planted,
      watered: counts.watered,
      feedback: this.farm.feedback,
    });
  }

  private resizeCamera(size: Phaser.Structs.Size): void {
    const widthRatio = size.width / WORLD_WIDTH;
    const heightRatio = size.height / WORLD_HEIGHT;
    const portrait = size.height >= size.width;
    const zoom = portrait
      ? Math.max(widthRatio, heightRatio)
      : Math.max(0.75, Math.min(widthRatio, heightRatio));
    this.cameras.main.setZoom(zoom);
  }

  private directionFromVector(x: number, y: number): Direction {
    if (Math.abs(x) > Math.abs(y)) return x < 0 ? "left" : "right";
    return y < 0 ? "up" : "down";
  }

  private facingVector(): Phaser.Math.Vector2 {
    switch (this.facing) {
      case "up": return new Phaser.Math.Vector2(0, -1);
      case "left": return new Phaser.Math.Vector2(-1, 0);
      case "right": return new Phaser.Math.Vector2(1, 0);
      default: return new Phaser.Math.Vector2(0, 1);
    }
  }
}
