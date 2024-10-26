import { folder } from "leva";
import {
  // BaseComponentDefinition,
  createControlHandlers,
  // UpdateFunction,
} from "./ComponentRegistry";
import * as THREE from "three";
import { useRef, useMemo } from "react";

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

export const Box = (props) => {
  const { geometry, material } = boxDefinition;
  const meshRef = useRef();

  // Create geometry
  const geometryArgs = geometry.args.map((arg) => props[arg]);
  const geometryInstance = useMemo(() => {
    const GeometryClass = THREE[geometry.type];
    return new GeometryClass(...geometryArgs);
  }, geometryArgs);

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
      type="Box"
      geometry={geometryInstance}
      material={materialInstance}
    />
  );
};

export const BoxDefinition = {
  component: Box,
  getControls: (id, updateComponent) => ({
    dimensions: folder({
      width: {
        value: 1,
        min: 0.1,
        max: 10,
        step: 0.1,
        label: "Width",
        ...createControlHandlers(id, updateComponent, "width"),
      },
      height: {
        value: 1,
        min: 0.1,
        max: 10,
        step: 0.1,
        label: "Height",
        ...createControlHandlers(id, updateComponent, "height"),
      },
      length: {
        value: 1,
        min: 0.1,
        max: 20,
        step: 0.1,
        label: "Length",
        ...createControlHandlers(id, updateComponent, "length"),
      },
      scale: {
        value: 1,
        label: "Scale",
        ...createControlHandlers(id, updateComponent, "scale"),
      },
    }),
    appearance: folder({
      color: {
        value: "orange",
        label: "Color",
        ...createControlHandlers(id, updateComponent, "color"),
      },
    }),
  }),
  defaultProps: boxDefinition.defaultProps,
};
