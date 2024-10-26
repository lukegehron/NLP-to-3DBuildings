import { Shape } from "three";
import { createControlHandlers } from "./ComponentRegistry";
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

export const WBeam = (props) => {
  const { geometry, material } = wBeamDefinition;
  const meshRef = useRef();

  // Create geometry
  const geometryInstance = useMemo(() => {
    const GeometryClass = THREE[geometry.type];
    const shape = geometry.args[0](props);
    const options = Object.fromEntries(
      Object.entries(geometry.args[1]).map(([key, value]) => [
        key,
        props[value] || value,
      ])
    );
    return new GeometryClass(shape, options);
  }, [props]);

  // Create material
  const materialProps = Object.fromEntries(
    Object.entries(material.props).map(([key, value]) => [key, props[value]])
  );
  const materialInstance = useMemo(() => {
    const MaterialClass = THREE[material.type];
    return new MaterialClass(materialProps);
  }, [JSON.stringify(materialProps)]);

  return (
    <mesh
      ref={meshRef}
      {...props}
      type="WBeam"
      geometry={geometryInstance}
      material={materialInstance}
    />
  );
};

export const WBeamDefinition = {
  component: WBeam,
  getControls: (id, updateComponent) => {
    const controls = {};

    Object.entries(wBeamDefinition.controls).forEach(
      ([folderName, folderControls]) => {
        controls[folderName] = folder(
          Object.entries(folderControls).reduce((acc, [key, config]) => {
            acc[key] = {
              value: config.value,
              label: key.charAt(0).toUpperCase() + key.slice(1),
              ...config,
              ...createControlHandlers(id, updateComponent, key),
            };
            return acc;
          }, {})
        );
      }
    );

    return controls;
  },
  defaultProps: wBeamDefinition.defaultProps,
};
