import { WBeamDefinition } from "./WBeam.jsx";
import { BoxDefinition } from "./Box.jsx";
import { TableDefinition } from "./Table.jsx";
import { BuildingDefinition } from "./Building.jsx";
// import { Schema } from "leva/dist/declarations/src/types";
// import { ComponentProps } from "../types.js";

export const ComponentRegistry = {
  WBeam: WBeamDefinition,
  Box: BoxDefinition,
  Table: TableDefinition,
  Building: BuildingDefinition,
};

export const createControlHandlers = (id, updateComponent, propertyKey) => ({
  onEditEnd: (value) => {
    console.log("onEditEnd", value);
    updateComponent({ id, props });
  },
});
