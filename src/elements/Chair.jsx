import { createComponentFromJson } from "./genericJsonImport";

// JSON structure for Chair component
const chairDefinition = {
  component: "Chair",
  parts: [
    {
      name: "seat",
      geometry: {
        type: "BoxGeometry",
        args: ["seatWidth", "seatHeight", "seatDepth"],
      },
      material: {
        type: "MeshStandardMaterial",
        props: { color: "color" },
      },
      position: [0, "legHeight + seatHeight / 2", 0],
    },
    {
      name: "backrest",
      geometry: {
        type: "BoxGeometry",
        args: ["backWidth", "backHeight", "backDepth"],
      },
      material: {
        type: "MeshStandardMaterial",
        props: { color: "color" },
      },
      position: [
        0,
        "legHeight + seatHeight + backHeight / 2",
        "-seatDepth / 2 + backDepth / 2",
      ],
    },
    {
      name: "legFrontLeft",
      geometry: {
        type: "BoxGeometry",
        args: ["legWidth", "legHeight", "legWidth"],
      },
      material: {
        type: "MeshStandardMaterial",
        props: { color: "color" },
      },
      position: [
        "-seatWidth / 2 + legWidth / 2",
        "legHeight / 2",
        "seatDepth / 2 - legWidth / 2",
      ],
    },
    {
      name: "legFrontRight",
      geometry: {
        type: "BoxGeometry",
        args: ["legWidth", "legHeight", "legWidth"],
      },
      material: {
        type: "MeshStandardMaterial",
        props: { color: "color" },
      },
      position: [
        "seatWidth / 2 - legWidth / 2",
        "legHeight / 2",
        "seatDepth / 2 - legWidth / 2",
      ],
    },
    {
      name: "legBackLeft",
      geometry: {
        type: "BoxGeometry",
        args: ["legWidth", "legHeight", "legWidth"],
      },
      material: {
        type: "MeshStandardMaterial",
        props: { color: "color" },
      },
      position: [
        "-seatWidth / 2 + legWidth / 2",
        "legHeight / 2",
        "-seatDepth / 2 + legWidth / 2",
      ],
    },
    {
      name: "legBackRight",
      geometry: {
        type: "BoxGeometry",
        args: ["legWidth", "legHeight", "legWidth"],
      },
      material: {
        type: "MeshStandardMaterial",
        props: { color: "color" },
      },
      position: [
        "seatWidth / 2 - legWidth / 2",
        "legHeight / 2",
        "-seatDepth / 2 + legWidth / 2",
      ],
    },
  ],
  controls: {
    dimensions: {
      seatWidth: { value: 0.5, min: 0.3, max: 1, step: 0.05 },
      seatHeight: { value: 0.05, min: 0.02, max: 0.1, step: 0.01 },
      seatDepth: { value: 0.5, min: 0.3, max: 0.8, step: 0.05 },
      backWidth: { value: 0.5, min: 0.3, max: 1, step: 0.05 },
      backHeight: { value: 0.6, min: 0.4, max: 1, step: 0.05 },
      backDepth: { value: 0.05, min: 0.02, max: 0.1, step: 0.01 },
      legWidth: { value: 0.05, min: 0.02, max: 0.1, step: 0.01 },
      legHeight: { value: 0.4, min: 0.3, max: 0.6, step: 0.05 },
    },
    appearance: {
      color: { value: "brown" },
    },
  },
  defaultProps: {
    seatWidth: 0.5,
    seatHeight: 0.05,
    seatDepth: 0.5,
    backWidth: 0.5,
    backHeight: 0.6,
    backDepth: 0.05,
    legWidth: 0.05,
    legHeight: 0.4,
    color: "brown",
  },
};

const { Component: Chair, ComponentDefinition: ChairDefinition } =
  createComponentFromJson(chairDefinition);

export { Chair, ChairDefinition };
