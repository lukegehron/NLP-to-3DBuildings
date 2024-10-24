import { useState } from "react";
import { funName, stringToColor } from "../utils/nameGenerator";

const NAME_KEY = "buildosaur-name";
const COLOR_KEY = "buildosaur-color";

const DEFAULT_NAME = funName();

export const useName = () => {
  const [name, _setName] = useState(() => {
    const storedName = localStorage.getItem(NAME_KEY);
    if (storedName) {
      return storedName;
    } else {
      localStorage.setItem(NAME_KEY, DEFAULT_NAME);
      return DEFAULT_NAME;
    }
  });

  const setName = (newName: string) => {
    localStorage.setItem(NAME_KEY, newName);
    _setName(newName);
  };

  const [color, _setColor] = useState(() => {
    const storedColor = localStorage.getItem(COLOR_KEY);
    if (storedColor) {
      return storedColor;
    } else {
      const newColor = stringToColor(DEFAULT_NAME);
      localStorage.setItem(COLOR_KEY, newColor);
      return newColor;
    }
  });

  const setColor = (newColor: string) => {
    localStorage.setItem(COLOR_KEY, newColor);
    _setColor(newColor);
  };

  console.log({ name, color });

  return {
    name,
    setName,
    color,
    setColor,
  };
};
