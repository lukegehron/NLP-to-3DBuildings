import { createComponentFromJson } from "./genericJsonImport";

// JSON structure for Table component
const tableDefinition = {
  component: "Table",
  parts: [
    {
      name: "tabletop",
      geometry: {
        type: "BoxGeometry",
        args: ["topWidth", "topHeight", "topLength"],
      },
      material: {
        type: "MeshStandardMaterial",
        props: { color: "color" },
      },
      position: [0, "legHeight + topHeight / 2", 0],
    },
    {
      name: "leg1",
      geometry: {
        type: "BoxGeometry",
        args: ["legWidth", "legHeight", "legLength"],
      },
      material: {
        type: "MeshStandardMaterial",
        props: { color: "color" },
      },
      position: [
        "-topWidth / 2 + legWidth / 2",
        "legHeight / 2",
        "-topLength / 2 + legLength / 2",
      ],
    },
    {
      name: "leg2",
      geometry: {
        type: "BoxGeometry",
        args: ["legWidth", "legHeight", "legLength"],
      },
      material: {
        type: "MeshStandardMaterial",
        props: { color: "color" },
      },
      position: [
        "topWidth / 2 - legWidth / 2",
        "legHeight / 2",
        "-topLength / 2 + legLength / 2",
      ],
    },
    {
      name: "leg3",
      geometry: {
        type: "BoxGeometry",
        args: ["legWidth", "legHeight", "legLength"],
      },
      material: {
        type: "MeshStandardMaterial",
        props: { color: "color" },
      },
      position: [
        "-topWidth / 2 + legWidth / 2",
        "legHeight / 2",
        "topLength / 2 - legLength / 2",
      ],
    },
    {
      name: "leg4",
      geometry: {
        type: "BoxGeometry",
        args: ["legWidth", "legHeight", "legLength"],
      },
      material: {
        type: "MeshStandardMaterial",
        props: { color: "color" },
      },
      position: [
        "topWidth / 2 - legWidth / 2",
        "legHeight / 2",
        "topLength / 2 - legLength / 2",
      ],
    },
  ],
  controls: {
    dimensions: {
      legWidth: { value: 0.1, min: 0.05, max: 0.5, step: 0.01 },
      legHeight: { value: 1, min: 0.5, max: 2, step: 0.1 },
      legLength: { value: 0.1, min: 0.05, max: 0.5, step: 0.01 },
      topWidth: { value: 2, min: 1, max: 5, step: 0.1 },
      topHeight: { value: 0.1, min: 0.05, max: 0.5, step: 0.01 },
      topLength: { value: 2, min: 1, max: 5, step: 0.1 },
    },
    appearance: {
      color: { value: "brown" },
    },
  },
  defaultProps: {
    legWidth: 0.1,
    legHeight: 1,
    legLength: 0.1,
    topWidth: 2,
    topHeight: 0.1,
    topLength: 2,
    color: "brown",
  },
};

const { Component: Table, ComponentDefinition: TableDefinition } =
  createComponentFromJson(tableDefinition);

export { Table, TableDefinition };
