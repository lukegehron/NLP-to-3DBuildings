import { Shape } from "three";

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
  width = 1,
  height = 1,
  length = 10,
  color = "orange",
  ...props
}) => {
  return (
    <mesh {...props} type="WBeam">
      <extrudeGeometry
        args={[getWBeamProfile({}), { depth: length, bevelEnabled: false }]}
      />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};
