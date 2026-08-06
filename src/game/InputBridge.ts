type HoldAction = "up" | "down" | "left" | "right" | "run";
type TapAction = "tool-prev" | "tool-next" | "use";

type TapListener = (action: TapAction) => void;

class InputBridge {
  private readonly held = new Set<HoldAction>();
  private readonly listeners = new Set<TapListener>();

  setHeld(action: HoldAction, active: boolean): void {
    if (active) this.held.add(action);
    else this.held.delete(action);
  }

  isHeld(action: HoldAction): boolean {
    return this.held.has(action);
  }

  tap(action: TapAction): void {
    for (const listener of this.listeners) listener(action);
  }

  subscribe(listener: TapListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  clear(): void {
    this.held.clear();
  }
}

export const inputBridge = new InputBridge();
