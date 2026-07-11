import type { CharacterDebugSnapshot } from '../game/actors/CharacterPawn';
import type { DialogueSnapshot } from '../game/features/dialogue/DialogueModel';
import type { TimelineSnapshot } from '../game/features/timeline/SandboxTimeline';

declare global {
  interface Window {
    __AMD_SANDBOX__?: {
      ready: boolean;
      scene: string;
      dialogue: DialogueSnapshot | null;
      timeline: TimelineSnapshot;
      characters: CharacterDebugSnapshot[];
      lastInteraction: string;
    };
  }
}

export {};
