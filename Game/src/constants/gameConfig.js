export const scoreOptions = [
  { value: 3, color: "orange", label: "Power Flick" },
  { value: 1, color: "yellow", label: "Steady Single" },
  { value: 4, color: "blue", label: "Cover Drive" },
  { value: 6, color: "emerald", label: "Big Six" },
  { value: "W", color: "red", label: "Edge & Out" },
  { value: ".", color: "gray", label: "Dot Ball" },
  { value: 2, color: "pink", label: "Quick Double" },
];

export const ballSpeedMap = {
  FAST: 95,
  MEDIUM_FAST: 130,
  MEDIUM: 165,
  SLOW: 240,
};

export const aiProfiles = {
  CASUAL: {
    minBalls: 7,
    maxBalls: 9,
    aggression: 0.45,
    banner: "Backyard vibes",
  },
  COMPETITIVE: {
    minBalls: 6,
    maxBalls: 8,
    aggression: 0.65,
    banner: "Club level tactics",
  },
  ELITE: {
    minBalls: 4,
    maxBalls: 7,
    aggression: 0.85,
    banner: "International intensity",
  },
};

export const wicketsLimit = 2;

export const ballsPerInningsTwoPlayer = 8;

export const getRandomItem = (collection) =>
  collection[Math.floor(Math.random() * collection.length)];

export const randomInRange = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

