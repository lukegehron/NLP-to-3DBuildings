import { folder } from "leva";
import {
  // BaseComponentDefinition,
  createControlHandlers,
  // UpdateFunction,
} from "./ComponentRegistry";
import * as THREE from "three";
import { useRef, useMemo } from "react";

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

export const Table = (props) => {
  const groupRef = useRef();

  const parts = useMemo(() => {
    return tableDefinition.parts.map((part) => {
      const GeometryClass = THREE[part.geometry.type];
      const MaterialClass = THREE[part.material.type];

      const geometryArgs = part.geometry.args.map((arg) => props[arg]);
      const geometry = new GeometryClass(...geometryArgs);

      const materialProps = Object.fromEntries(
        Object.entries(part.material.props).map(([key, value]) => [
          key,
          props[value],
        ])
      );
      const material = new MaterialClass(materialProps);

      const position = part.position.map((pos) => {
        if (typeof pos === "string") {
          // eslint-disable-next-line no-eval
          return eval(pos.replace(/([a-zA-Z]+)/g, "props.$1"));
        }
        return pos;
      });

      return { geometry, material, position };
    });
  }, [props]);

  return (
    <group ref={groupRef} {...props} type="Table">
      {parts.map((part, index) => (
        <mesh
          key={index}
          geometry={part.geometry}
          material={part.material}
          position={part.position}
        />
      ))}
    </group>
  );
};

export const TableDefinition = {
  component: Table,
  getControls: (id, updateComponent) => {
    const controls = {};

    Object.entries(tableDefinition.controls).forEach(
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
  defaultProps: tableDefinition.defaultProps,
};
