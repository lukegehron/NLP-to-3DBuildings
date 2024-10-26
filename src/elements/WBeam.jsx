import { Shape } from "three";
import { createComponentFromJson } from "./genericJsonImport";
import { folder } from "leva";
import * as THREE from "three";
import { useRef, useMemo } from "react";

// JSON structure for WBeam component
const wBeamDefinition = {
  component: "WBeam",
  geometry: {
    type: "ExtrudeGeometry",
    args: [
      (props) => getWBeamProfile(props),
      { depth: "length", bevelEnabled: false },
    ],
  },
  material: {
    type: "MeshStandardMaterial",
    props: {
      color: "color",
    },
  },
  controls: {
    dimensions: {
      width: { value: 1, min: 0.1, max: 5, step: 0.1 },
      depth: { value: 1, min: 0.1, max: 5, step: 0.1 },
      length: { value: 10, min: 1, max: 50, step: 1 },
    },
    profile: {
      webThickness: { value: 0.1, min: 0.01, max: 0.5, step: 0.01 },
      flangeThickness: { value: 0.1, min: 0.01, max: 0.5, step: 0.01 },
    },
    appearance: {
      color: { value: "orange" },
    },
  },
  defaultProps: {
    width: 1,
    depth: 1,
    length: 10,
    webThickness: 0.1,
    flangeThickness: 0.1,
    color: "orange",
  },
};

const getWBeamProfile = ({
  depth = 1,
  width = 1,
  webThickness = 0.1,
  flangeThickness = 0.1,
}) => {
  // Calculate half dimensions for symmetry around origin
  const halfWidth = width / 2;
  const halfDepth = depth / 2;
  const halfWebThickness = webThickness / 2;

  const shape = new Shape();

  // Start at top-right corner
  shape.moveTo(halfWidth, -halfDepth);

  // Draw upper flange (right to left)
  shape.lineTo(-halfWidth, -halfDepth);

  // Draw down left side (including web connection)
  shape.lineTo(-halfWidth, -(halfDepth - flangeThickness));
  shape.lineTo(-halfWebThickness, -(halfDepth - flangeThickness));
  shape.lineTo(-halfWebThickness, halfDepth - flangeThickness);

  // Draw lower flange (left to right)
  shape.lineTo(-halfWidth, halfDepth - flangeThickness);
  shape.lineTo(-halfWidth, halfDepth);
  shape.lineTo(halfWidth, halfDepth);

  // Draw up right side (including web connection)
  shape.lineTo(halfWidth, halfDepth - flangeThickness);
  shape.lineTo(halfWebThickness, halfDepth - flangeThickness);
  shape.lineTo(halfWebThickness, -(halfDepth - flangeThickness));
  shape.lineTo(halfWidth, -(halfDepth - flangeThickness)); // Added missing segment

  // Close the shape by returning to start
  shape.lineTo(halfWidth, -halfDepth);

  return shape;
};

const { Component: WBeam, ComponentDefinition: WBeamDefinition } =
  createComponentFromJson(wBeamDefinition);

export { WBeam, WBeamDefinition };
