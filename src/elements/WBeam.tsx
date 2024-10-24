import { Shape } from "three";
import {
  BaseComponentDefinition,
  createControlHandlers,
  UpdateFunction,
} from "./ComponentRegistry";
import { folder } from "leva";

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

export const WBeam = ({
  depth = 1,
  width = 1,
  webThickness = 0.1,
  flangeThickness = 0.1,
  length = 10,
  color = "orange",
  ...props
}) => {
  return (
    <mesh {...props} type="WBeam">
      <extrudeGeometry
        args={[
          getWBeamProfile({ depth, width, webThickness, flangeThickness }),
          { depth: length, bevelEnabled: false },
        ]}
      />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

export const WBeamDefinition: BaseComponentDefinition = {
  component: WBeam,
  getControls: (id: string, updateComponent: UpdateFunction) => ({
    dimensions: folder({
      width: {
        value: 1,
        min: 0.1,
        max: 5,
        step: 0.1,
        label: "Width",
        ...createControlHandlers(id, updateComponent, "width"),
      },
      height: {
        value: 1,
        min: 0.1,
        max: 5,
        step: 0.1,
        label: "Height",
        ...createControlHandlers(id, updateComponent, "height"),
      },
      length: {
        value: 10,
        min: 1,
        max: 50,
        step: 1,
        label: "Length",
        ...createControlHandlers(id, updateComponent, "length"),
      },
    }),
    appearance: folder({
      color: {
        value: "orange",
        label: "Color",
        ...createControlHandlers(id, updateComponent, "color"),
      },
    }),
    profile: folder({
      webThickness: {
        value: 0.1,
        min: 0.01,
        max: 0.5,
        step: 0.01,
        label: "Web Thickness",
        ...createControlHandlers(id, updateComponent, "webThickness"),
      },
      flangeThickness: {
        value: 0.1,
        min: 0.01,
        max: 0.5,
        step: 0.01,
        label: "Flange Thickness",
        ...createControlHandlers(id, updateComponent, "flangeThickness"),
      },
    }),
  }),
  defaultProps: {
    width: 1,
    height: 1,
    length: 10,
    color: "orange",
    webThickness: 0.1,
    flangeThickness: 0.1,
  },
};
