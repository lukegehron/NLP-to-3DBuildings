import { WBeamDefinition } from "./WBeam";
import { BoxDefinition } from "./Box";
import { Schema } from "leva/dist/declarations/src/types";
import { ComponentProps } from "../types";

export type UpdateFunction = ({
  id,
  props,
}: {
  id: string;
  props: Partial<ComponentProps>;
}) => void;

export interface BaseComponentDefinition {
  component: React.ComponentType<any>;
  // Leva control configuration
  getControls: (id: string, updateComponent: UpdateFunction) => Schema;
  // Optional default props
  defaultProps?: Record<string, any>;
}

export type ComponentRegistryType = Record<string, BaseComponentDefinition>;

export const ComponentRegistry: ComponentRegistryType = {
  WBeam: WBeamDefinition,
  Box: BoxDefinition,
};

export const createControlHandlers = (
  id: string,
  updateComponent: UpdateFunction,
  propertyKey: string
) => ({
  onEditEnd: (value: any) => {
    updateComponent({ id, props: { [propertyKey]: value } });
  },
});
