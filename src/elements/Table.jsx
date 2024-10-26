import { folder } from "leva";
import {
  // BaseComponentDefinition,
  createControlHandlers,
  // UpdateFunction,
} from "./ComponentRegistry";

export const Table = ({
  legWidth = 0.1,
  legHeight = 1,
  legLength = 0.1,
  topWidth = 2,
  topHeight = 0.1,
  topLength = 2,
  color = "brown",
  ...props
}) => {
  return (
    <group {...props} type="Table">
      {/* Tabletop */}
      <mesh position={[0, legHeight + topHeight / 2, 0]}>
        <boxGeometry args={[topWidth, topHeight, topLength]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Legs */}
      <mesh
        position={[
          -topWidth / 2 + legWidth / 2,
          legHeight / 2,
          -topLength / 2 + legLength / 2,
        ]}
      >
        <boxGeometry args={[legWidth, legHeight, legLength]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh
        position={[
          topWidth / 2 - legWidth / 2,
          legHeight / 2,
          -topLength / 2 + legLength / 2,
        ]}
      >
        <boxGeometry args={[legWidth, legHeight, legLength]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh
        position={[
          -topWidth / 2 + legWidth / 2,
          legHeight / 2,
          topLength / 2 - legLength / 2,
        ]}
      >
        <boxGeometry args={[legWidth, legHeight, legLength]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh
        position={[
          topWidth / 2 - legWidth / 2,
          legHeight / 2,
          topLength / 2 - legLength / 2,
        ]}
      >
        <boxGeometry args={[legWidth, legHeight, legLength]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
};

export const TableDefinition = {
  component: Table,
  getControls: (id, updateComponent) => ({
    dimensions: folder({
      legWidth: {
        value: 0.1,
        min: 0.05,
        max: 0.5,
        step: 0.01,
        label: "Leg Width",
        ...createControlHandlers(id, updateComponent, "legWidth"),
      },
      legHeight: {
        value: 1,
        min: 0.5,
        max: 2,
        step: 0.1,
        label: "Leg Height",
        ...createControlHandlers(id, updateComponent, "legHeight"),
      },
      legLength: {
        value: 0.1,
        min: 0.05,
        max: 0.5,
        step: 0.01,
        label: "Leg Length",
        ...createControlHandlers(id, updateComponent, "legLength"),
      },
      topWidth: {
        value: 2,
        min: 1,
        max: 5,
        step: 0.1,
        label: "Top Width",
        ...createControlHandlers(id, updateComponent, "topWidth"),
      },
      topHeight: {
        value: 0.1,
        min: 0.05,
        max: 0.5,
        step: 0.01,
        label: "Top Height",
        ...createControlHandlers(id, updateComponent, "topHeight"),
      },
      topLength: {
        value: 2,
        min: 1,
        max: 5,
        step: 0.1,
        label: "Top Length",
        ...createControlHandlers(id, updateComponent, "topLength"),
      },
    }),
    appearance: folder({
      color: {
        value: "brown",
        label: "Color",
        ...createControlHandlers(id, updateComponent, "color"),
      },
    }),
  }),
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
