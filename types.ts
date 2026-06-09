export type GameScreen =
  | "menu"
  | "level-select"
  | "playing"
  | "level-complete"
  | "game-over"
  | "win";

export type LevelId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface LevelInfo {
  id: LevelId;
  nerve: string;
  title: string;
  description: string;
  controls: string;
  implemented: boolean;
}

export interface GameState {
  screen: GameScreen;
  currentLevel: LevelId;
  stress: number;
  completedLevels: Set<LevelId>;
  score: number;
}

export const LEVELS: LevelInfo[] = [
  {
    id: 1,
    nerve: "CN I",
    title: "Olfactory",
    description: "Grasp the vial and bring it to the patient's nose.",
    controls: "Q/W/E/R — fingers | A/D — arm",
    implemented: true,
  },
  {
    id: 2,
    nerve: "CN II",
    title: "Optic",
    description: "Control the patient's eyeballs to focus on the eye chart.",
    controls: "Arrow keys — gaze direction",
    implemented: true,
  },
  {
    id: 3,
    nerve: "CN III/IV/VI",
    title: "Eye Movement",
    description: "Trace a smooth H-pattern without poking the patient's eye.",
    controls: "Mouse — penlight position",
    implemented: true,
  },
  {
    id: 4,
    nerve: "CN V",
    title: "Trigeminal",
    description: "Touch the patient's face with objects using the laggy mouse.",
    controls: "Mouse (severe lag) | Left Click — soft | Right Click — sharp",
    implemented: true,
  },
  {
    id: 5,
    nerve: "CN VII",
    title: "Facial Nerve",
    description: "Activate the correct muscle groups to match the expression.",
    controls: "Keys 1–0 — facial muscle groups",
    implemented: true,
  },
  {
    id: 6,
    nerve: "CN VIII",
    title: "Vestibulocochlear",
    description: "Strike the tuning fork and place it on the patient's head.",
    controls: "SPACE — power meter | Arrow Keys — positioning",
    implemented: true,
  },
  {
    id: 7,
    nerve: "CN IX/X",
    title: "Gag Reflex",
    description: "Navigate inside the mouth before it snaps shut.",
    controls: "W/A/S/D — arm | Mouse — angle",
    implemented: true,
  },
  {
    id: 8,
    nerve: "CN XI",
    title: "Accessory",
    description: "Apply pressure and resist the patient's shoulder movement.",
    controls: "Hold Left Mouse — resist shrug",
    implemented: true,
  },
  {
    id: 9,
    nerve: "CN XII",
    title: "Hypoglossal",
    description: "Control the slimy physics-tongue from side to side.",
    controls: "Mouse — drag tongue",
    implemented: true,
  },
  {
    id: 10,
    nerve: "Bonus",
    title: "Crisis Mode",
    description: "All nerves are failing at once. Godspeed.",
    controls: "All of the above, simultaneously",
    implemented: false,
  },
  {
    id: 11,
    nerve: "Bonus",
    title: "Night Shift",
    description: "Everything is the same, but you've been awake 36 hours.",
    controls: "Same as before, but worse",
    implemented: false,
  },
  {
    id: 12,
    nerve: "Bonus",
    title: "The Debrief",
    description: "Explain to the patient what just happened. Good luck.",
    controls: "Type your apology",
    implemented: false,
  },
];

export const DEADPAN_DIALOGUE: Record<string, string[]> = {
  drop: [
    "Pardon me. I seem to have dropped something.",
    "Not to worry. The floor is mostly clean.",
    "I've seen worse. Once.",
  ],
  poke: [
    "Oh. You appear to have made contact with my eye.",
    "Do carry on. I can see from the other one.",
    "A minor inconvenience, I'm sure.",
  ],
  vomit: [
    "Ah. An atypical gastric response. Very interesting.",
    "Quite. I'll make a note of that.",
    "This happens more than you'd think.",
  ],
  stress: [
    "I'm perfectly calm. Please do stop.",
    "This is fine.",
    "I've scheduled a therapist for after this appointment.",
  ],
  success: [
    "Well. That was adequate.",
    "Hm. Not entirely catastrophic.",
    "I've seen worse. Not much worse, but worse.",
  ],
};
