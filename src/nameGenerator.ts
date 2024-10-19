// Generated with Claude Sonnet 3.5
const adjectives = [
  "Zesty",
  "Quirky",
  "Bubbly",
  "Peppy",
  "Snazzy",
  "Jolly",
  "Perky",
  "Jazzy",
  "Spunky",
  "Zippy",
  "Chipper",
  "Bouncy",
  "Giddy",
  "Punchy",
  "Spiffy",
  "Lively",
  "Upbeat",
  "Fizzy",
  "Merry",
  "Jaunty",
  "Nutty",
  "Groovy",
  "Dandy",
  "Cheery",
  "Peppy",
  "Spruce",
  "Frisky",
  "Plucky",
  "Dapper",
  "Peachy",
  "Witty",
  "Breezy",
  "Chirpy",
  "Nifty",
  "Sunny",
  "Vivid",
  "Gleamy",
  "Joyous",
  "Dazzly",
  "Zippy",
  "Playful",
  "Frothy",
  "Mellow",
  "Keen",
  "Lush",
  "Comfy",
  "Cozy",
  "Snug",
  "Sparkly",
  "Swanky",
];

const nouns = [
  "Cat",
  "Dog",
  "Hat",
  "Frog",
  "Book",
  "Cake",
  "Sun",
  "Moon",
  "Star",
  "Tree",
  "Bird",
  "Fish",
  "Bee",
  "Bear",
  "Duck",
  "Pig",
  "Goat",
  "Lion",
  "Wolf",
  "Fox",
  "Owl",
  "Rose",
  "Daisy",
  "Lily",
  "Rock",
  "Sand",
  "Lake",
  "River",
  "Ocean",
  "Cloud",
  "Rain",
  "Snow",
  "Wind",
  "Fire",
  "Ice",
  "Leaf",
  "Seed",
  "Apple",
  "Pear",
  "Plum",
  "Kiwi",
  "Cup",
  "Bowl",
  "Pen",
  "Toy",
  "Ball",
  "Kite",
  "Drum",
  "Bell",
  "Harp",
];

export const funName = () => {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj}-${noun}`.toLowerCase();
};

export const stringToColor = (inputString: string): string => {
  // Generate a hash of the input string
  let hash = 0;
  for (let i = 0; i < inputString.length; i++) {
    const char = inputString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use the hash to generate RGB values
  const r = (hash & 0xff0000) >> 16;
  const g = (hash & 0x00ff00) >> 8;
  const b = hash & 0x0000ff;

  // Ensure the color is not too dark
  const minBrightness = 100;
  const brightR = Math.max(r, minBrightness);
  const brightG = Math.max(g, minBrightness);
  const brightB = Math.max(b, minBrightness);

  // Convert to hexadecimal color code
  return `#${brightR.toString(16).padStart(2, "0")}${brightG
    .toString(16)
    .padStart(2, "0")}${brightB.toString(16).padStart(2, "0")}`;
};
