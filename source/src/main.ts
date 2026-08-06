import Phaser from "phaser";
import "./style.css";
import { GameScene } from "./game/GameScene";
import { inputBridge } from "./game/InputBridge";

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#294a32",
  pixelArt: true,
  roundPixels: true,
  render: {
    antialias: false,
    pixelArt: true,
    roundPixels: true,
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  scene: [GameScene],
});

const bindHoldButton = (button: HTMLButtonElement, action: "up" | "down" | "left" | "right" | "run"): void => {
  const press = (event: PointerEvent): void => {
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    inputBridge.setHeld(action, true);
    button.classList.add("active");
  };
  const release = (event: PointerEvent): void => {
    event.preventDefault();
    inputBridge.setHeld(action, false);
    button.classList.remove("active");
  };
  button.addEventListener("pointerdown", press);
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("lostpointercapture", release);
};

for (const element of document.querySelectorAll<HTMLButtonElement>("[data-hold]")) {
  const action = element.dataset.hold;
  if (action === "up" || action === "down" || action === "left" || action === "right" || action === "run") {
    bindHoldButton(element, action);
  }
}

for (const element of document.querySelectorAll<HTMLButtonElement>("[data-tap]")) {
  element.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    const action = element.dataset.tap;
    if (action === "tool-prev" || action === "tool-next" || action === "use") inputBridge.tap(action);
  });
}

const fullscreenButton = document.getElementById("fullscreen") as HTMLButtonElement | null;
if (fullscreenButton) {
  if (!document.fullscreenEnabled) fullscreenButton.hidden = true;
  fullscreenButton.addEventListener("click", async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      fullscreenButton.hidden = true;
    }
  });
  document.addEventListener("fullscreenchange", () => {
    fullscreenButton.textContent = document.fullscreenElement ? "EXIT" : "FULL";
  });
}

window.addEventListener("blur", () => inputBridge.clear());
window.addEventListener("contextmenu", (event) => event.preventDefault());
window.addEventListener("beforeunload", () => game.destroy(true));
