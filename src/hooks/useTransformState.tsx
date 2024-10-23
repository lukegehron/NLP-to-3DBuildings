import { useEffect, useMemo } from "react";
import { isValidMatrix, useSelTransformMap } from "./useSelTransformMap";
import { Euler, Matrix4, Quaternion, Vector3 } from "three";
import { useStorage } from "@liveblocks/react";

export const useTransformState = (uuid: string) => {
  const { selTransformMap } = useSelTransformMap();

  const selTransform = useMemo(() => {
    if (!uuid) {
      return null;
    }
    const item = selTransformMap.find(([_k, val]) => val.sel === uuid);
    if (!item) {
      return null;
    }
    return item[1].selTransform;
  }, [uuid, selTransformMap]);

  const component = useStorage((root) => root.components?.get(uuid)?.props);

  useEffect(() => {
    console.log("component props", component);
  }, [component]);

  const [position, rotation, scale] = useMemo(() => {
    if (selTransform && isValidMatrix(selTransform)) {
      const matrix = new Matrix4().fromArray(selTransform);

      let p = new Vector3();
      let r = new Quaternion();
      let s = new Vector3();
      matrix.decompose(p, r, s);
      matrix.decompose(p, r, s);

      let euler = new Euler().setFromQuaternion(r);

      return [p, euler, s];
    } else if (component) {
      console.log(component.props);
      const position = component.position;
      const rotation = component.rotation;
      const scale = component.scale;
      return [position, rotation, scale];
    } else {
      return [new Vector3(), new Euler(), new Vector3(1, 1, 1)];
    }
  }, [component, selTransform]);

  return {
    position,
    rotation,
    scale,
  };
};
