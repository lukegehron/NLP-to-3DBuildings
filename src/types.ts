import { LiveObject } from "@liveblocks/client";
import { EulerOrder } from "three";

export type Vector3 = [number, number, number];
export type EulerTuple = [number, number, number, EulerOrder];

export type Matrix4 = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number
];

type LsonValue =
  | string
  | number
  | boolean
  | null
  | Vector3
  | EulerTuple
  | { [key: string]: LsonValue }
  | Array<LsonValue>;

export type ComponentProps = {
  position: Vector3;
  rotation: EulerTuple;
  scale: Vector3;
  [key: string]: LsonValue;
};

export type SceneComponentData = {
  id: string;
  parentId?: string;
  type: string;
  // props: LiveObject<ComponentProps>;
};

export type SceneComponent = LiveObject<
  SceneComponentData & { props: LiveObject<ComponentProps> }
>;
