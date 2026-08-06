import Phaser from "phaser";
import { CELL_SIZE, COLLISIONS, PLAYER_START, PLOT, WORLD_HEIGHT, WORLD_WIDTH } from "./constants";
import { FarmState } from "./FarmState";
import { inputBridge } from "./InputBridge";
import { updateHud } from "./HudBridge";
import { TileFlag, TOOL_LABELS, type Direction, type Tool } from "./types";

const WALK_SPEED = 92;
const SPRINT_MULTIPLIER = 1.55;
const TOOL_LOCK_MS = 220;

const IDLE_FRAMES: Record<Direction, number> = {
  down: 0,
  up: 7,
  left: 14,
  right: 21,
};

const WALK_FRAMES: Record<Direction, number[]> = {
  down: [1, 2, 3, 4, 5, 6],
  up: [8, 9, 10, 11, 12, 13],
  left: [15, 16, 17, 18, 19, 20],
  right: [22, 23, 24, 25, 26, 27],
};

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private obstacles!: Phaser.Physics.Arcade.StaticGroup;
  private farmGraphics!: Phaser.GameObjects.Graphics;
  private cursorGraphics!: Phaser.GameObjects.Graphics;
  private toolGraphics!: Phaser.GameObjects.Graphics;
  private readonly farm = new FarmState();
  private facing: Direction = "down";
  private toolLockedUntil = 0;
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
    this.load.image("farm-world", `${base}assets/farm_world.webp`);
    this.load.spritesheet("farmer", `${base}assets/farmer_1.png`, {
      frameWidth: 48,
      frameHeight: 64,
    });
  }

  create(): void {
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.add.image(0, 0, "farm-world").setOrigin(0, 0).setDepth(0);

    this.obstacles = this.physics.add.staticGroup();
    this.createCollisions();
    this.createAnimations();

    this.farmGraphics = this.add.graphics().setDepth(4);
    this.cursorGraphics = this.add.graphics().setDepth(20);
    this.toolGraphics = this.add.graphics().setDepth(21);

    this.player = this.physics.add.sprite(PLAYER_START.x, PLAYER_START.y, "farmer", IDLE_FRAMES.down);
    this.player.setDepth(10).setCollideWorldBounds(true);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setSize(12, 18);
    body.setOffset(18, 40);

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
    }) as Record<string, Phaser.Input.Keyboard.Key>;

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

    const locked = time < this.toolLockedUntil;
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
    if (moving) {
      this.facing = this.directionFromVector(horizontal, vertical);
      const animation = `walk-${this.facing}`;
      if (this.player.anims.currentAnim?.key !== animation) this.player.play(animation, true);
      this.player.anims.timeScale = sprinting ? 1.45 : 1;
    } else {
      this.player.anims.stop();
      this.player.setFrame(IDLE_FRAMES[this.facing]);
    }

    this.updateTarget();
    this.drawToolIndicator(locked);
    this.updateHud();
  }

  private createAnimations(): void {
    for (const direction of Object.keys(WALK_FRAMES) as Direction[]) {
      this.anims.create({
        key: `walk-${direction}`,
        frames: WALK_FRAMES[direction].map((frame) => ({ key: "farmer", frame })),
        frameRate: 8.3,
        repeat: -1,
      });
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
    if (this.time.now < this.toolLockedUntil) return;
    if (!this.targetCell.valid) {
      this.farm.feedback = "Face a tile inside the farm plot.";
      this.updateHud();
      return;
    }

    const changed = this.farm.interact(this.targetCell.column, this.targetCell.row);
    if (changed) {
      this.toolLockedUntil = this.time.now + TOOL_LOCK_MS;
      this.player.setVelocity(0, 0);
    }
    this.renderFarm();
    this.updateHud();
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
    this.farmGraphics.clear();
    for (const [key, state] of this.farm.cells.entries()) {
      const parts = key.split(",").map(Number);
      const column = parts[0];
      const row = parts[1];
      if (column === undefined || row === undefined) continue;
      const x = PLOT.x + column * CELL_SIZE + 1;
      const y = PLOT.y + row * CELL_SIZE + 1;
      const size = CELL_SIZE - 2;

      if ((state & TileFlag.Tilled) !== 0) {
        this.farmGraphics.fillStyle(0x76513d, 1).fillRect(x, y, size, size);
        this.farmGraphics.lineStyle(1, 0x5e3d30, 1).lineBetween(x + 2, y + 5, x + size - 2, y + size - 9);
        this.farmGraphics.lineStyle(1, 0x8e654d, 1).lineBetween(x + 2, y + 10, x + size - 2, y + size - 4);
      }
      if ((state & TileFlag.Watered) !== 0) {
        this.farmGraphics.fillStyle(0x1f4856, 0.42).fillRect(x, y, size, size);
        this.farmGraphics.lineStyle(1, 0x73bbc0, 1).lineBetween(x + 3, y + 3, x + 9, y + 3);
      }
      if ((state & TileFlag.Seeded) !== 0) {
        this.farmGraphics.fillStyle(0xe6c76b, 1).fillCircle(x + 5, y + 7, 1.25);
        this.farmGraphics.fillCircle(x + 11, y + 9, 1.25);
        this.farmGraphics.fillStyle(0xd59f45, 1).fillCircle(x + 8, y + 12, 1);
      }
    }
  }

  private drawToolIndicator(locked: boolean): void {
    this.toolGraphics.clear();
    if (!locked) return;
    const vector = this.facingVector();
    const colors: Record<Tool, number> = {
      hand: 0xd9c26c,
      hoe: 0xb8b5aa,
      seeds: 0xe6c76b,
      "watering-can": 0x73bbc0,
    };
    this.toolGraphics.lineStyle(3, colors[this.farm.selectedTool], 1);
    this.toolGraphics.lineBetween(
      this.player.x + vector.x * 5,
      this.player.y + vector.y * 5,
      this.player.x + vector.x * 17,
      this.player.y + vector.y * 17,
    );
  }

  private updateHud(): void {
    const counts = this.farm.counts();
    updateHud({
      x: this.player.x,
      y: this.player.y,
      tool: TOOL_LABELS[this.farm.selectedTool],
      target: this.targetCell.valid ? `Tile ${String(this.targetCell.column + 1).padStart(2, "0")}, ${String(this.targetCell.row + 1).padStart(2, "0")}` : "Outside plot",
      tilled: counts.tilled,
      planted: counts.planted,
      watered: counts.watered,
      feedback: this.farm.feedback,
    });
  }

  private resizeCamera(size: Phaser.Structs.Size): void {
    const zoom = Math.max(1, Math.min(size.width / WORLD_WIDTH, size.height / WORLD_HEIGHT));
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
