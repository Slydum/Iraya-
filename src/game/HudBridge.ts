export interface HudState {
  x: number;
  y: number;
  tool: string;
  target: string;
  tilled: number;
  planted: number;
  watered: number;
  feedback: string;
}

const byId = (id: string): HTMLElement => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing HUD element: ${id}`);
  return element;
};

export function updateHud(state: HudState): void {
  byId("hud-position").textContent = `Position ${Math.round(state.x)}, ${Math.round(state.y)}`;
  byId("hud-tool").textContent = `Tool ${state.tool} · ${state.target}`;
  byId("hud-progress").textContent = `Tilled ${state.tilled} · Planted ${state.planted} · Watered ${state.watered}`;
  byId("hud-feedback").textContent = state.feedback;
}
