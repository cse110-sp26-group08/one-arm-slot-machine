/**
 * Static configuration for the slot machine.
 * Keeping these values together makes the balancing rules easier to tune.
 */
export const SYMBOLS = [
  "PROMPT",
  "TOKEN",
  "GPU",
  "AGENT",
  "VAPOR",
  "HYPE",
  "PIVOT",
  "SLIDE",
  "CACHE",
  "CHAOS",
];

export const SPIN_COST = 25;
export const INITIAL_TOKENS = 240;
export const INTRO_LOG = "No rounds played yet.";

export const PRIZE_VALUES = {
  PROMPT: 26,
  TOKEN: 34,
  GPU: 30,
  AGENT: 22,
  VAPOR: 8,
  HYPE: 14,
  PIVOT: 17,
  SLIDE: 11,
  CACHE: 19,
  CHAOS: 6,
};

export const DEFAULT_PURCHASE = {
  item: "No purchase yet",
  copy: "A post-spin purchase will appear here after the first completed round.",
};

export const PURCHASES = [
  {
    item: "Hallucination Firewall Plus",
    description: "Detects misinformation right after it ships to production.",
  },
  {
    item: "Executive Demo Smoke Machine",
    description: "Adds cinematic fog whenever the model stalls for six seconds.",
  },
  {
    item: "Prompt Engineer Cape",
    description: "Raises authority by 12 percent and accuracy by absolutely none.",
  },
  {
    item: "Autonomous Meeting Summarizer",
    description: "Converts one vague meeting into a cleaner vague meeting.",
  },
  {
    item: "GPU Meditation Retreat",
    description: "Helps your servers process the trauma of another benchmark blog post.",
  },
  {
    item: "Investor-Friendly Accuracy Chart",
    description: "Removes the y-axis so the trend looks spiritually upward.",
  },
  {
    item: "Token-Burning API Starter Pack",
    description: "Includes three endpoints and a fourth one marked enterprise only.",
  },
];
