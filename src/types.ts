import { type EulerTuple } from "three";

export type Vector3 = [number, number, number];

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

export type ComponentProps = {
  position?: Vector3;
  rotation?: EulerTuple;
  scale?: Vector3;
  [key: string]: any;
};

export type SceneComponent = {
  id: string;
  parentId?: string;
  type: string;
  props: ComponentProps;
};
