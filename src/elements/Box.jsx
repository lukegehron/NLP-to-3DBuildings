import { createComponentFromJson } from "./genericJsonImport";

// JSON structure for Box component
const boxDefinition = {
  component: "Box",
  geometry: {
    type: "BoxGeometry",
    args: ["width", "height", "length"],
  },
  material: {
    type: "MeshStandardMaterial",
    props: {
      color: "color",
    },
  },
  controls: {
    dimensions: {
      width: { value: 1, min: 0.1, max: 10, step: 0.1 },
      height: { value: 1, min: 0.1, max: 10, step: 0.1 },
      length: { value: 1, min: 0.1, max: 20, step: 0.1 },
      scale: { value: 1 },
    },
    appearance: {
      color: { value: "orange" },
    },
  },
  defaultProps: {
    width: 1,
    height: 1,
    length: 1,
    scale: 2,
    color: "orange",
  },
};

const { Component: Box, ComponentDefinition: BoxDefinition } =
  createComponentFromJson(boxDefinition);

export { Box, BoxDefinition };
