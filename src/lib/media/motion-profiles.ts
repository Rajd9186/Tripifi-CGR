import type { EnvironmentalEffect } from "./types";

/**
 * Destination-specific motion profiles. Mountains don't move — the camera
 * and atmosphere do. Each profile answers: "what would physically move here?"
 */
export type CameraMove = "slow-push" | "slow-drift" | "still";

export interface MotionProfile {
  camera: CameraMove;
  /** Camera cycle seconds (12–30s cinematic range). */
  cameraDuration: number;
  /** Environmental layers that genuinely move at this destination. */
  atmosphere: EnvironmentalEffect[];
  /** Cycle seconds per layer — deliberately unsynchronized. */
  cycles: Partial<Record<EnvironmentalEffect, number>>;
}

const MOUNTAIN: MotionProfile = {
  camera: "slow-push",
  cameraDuration: 28,
  atmosphere: ["mist"],
  cycles: { mist: 37 },
};

export const MOTION_PROFILES: Record<string, MotionProfile> = {
  kashmir: { ...MOUNTAIN, atmosphere: ["mist"], cycles: { mist: 37 } },
  ladakh: {
    camera: "slow-drift",
    cameraDuration: 30,
    atmosphere: [],
    cycles: {},
  },
  sikkim: { ...MOUNTAIN, atmosphere: ["mist"], cycles: { mist: 41 } },
  darjeeling: {
    camera: "slow-push",
    cameraDuration: 26,
    atmosphere: ["mist"],
    cycles: { mist: 37 },
  },
  goa: {
    camera: "slow-drift",
    cameraDuration: 32,
    atmosphere: ["water"],
    cycles: { water: 44 },
  },
  kerala: {
    camera: "slow-drift",
    cameraDuration: 30,
    atmosphere: ["water"],
    cycles: { water: 47 },
  },
  rajasthan: {
    camera: "slow-push",
    cameraDuration: 28,
    atmosphere: [],
    cycles: {},
  },
  meghalaya: { ...MOUNTAIN, atmosphere: ["mist"], cycles: { mist: 39 } },
  "northeast-india": { ...MOUNTAIN, atmosphere: ["mist"], cycles: { mist: 39 } },
  "west-bengal": { ...MOUNTAIN, atmosphere: ["mist"], cycles: { mist: 37 } },
};

export function motionProfileFor(destination: string): MotionProfile {
  return MOTION_PROFILES[destination.toLowerCase()] ?? { ...MOUNTAIN };
}
