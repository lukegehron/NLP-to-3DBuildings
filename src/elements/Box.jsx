import { folder } from "leva";
import {
  // BaseComponentDefinition,
  createControlHandlers,
  // UpdateFunction,
} from "./ComponentRegistry";

export const Box = ({
  width = 1,
  height = 1,
  length = 1,
  color = "orange",
  scale = 1,
  ...props
}) => {
  return (
    <mesh {...props} type="Box">
      <boxGeometry args={[width, height, length]} />
      <meshStandardMaterial color={color} />
    </mesh>
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
  defaultProps: {
    width: 1,
    height: 1,
    length: 1,
    scale: 2,
    color: "orange",
  },
};
