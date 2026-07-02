export type SceneState = "hero" | "problem" | "forge" | "architecture" | "cta";

export interface SceneEventPayload {
  state: SceneState;
  progress?: number;
}

type SceneEventListener = (payload: SceneEventPayload) => void;

class SceneEventBus {
  private listeners: SceneEventListener[] = [];

  subscribe(listener: SceneEventListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  emit(payload: SceneEventPayload) {
    this.listeners.forEach((listener) => listener(payload));
  }
}

export const sceneEventBus = new SceneEventBus();
