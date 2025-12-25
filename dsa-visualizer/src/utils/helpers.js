export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const randomArray = (size = 8) =>
  Array.from({ length: size }, () => randomInt(5, 100));
