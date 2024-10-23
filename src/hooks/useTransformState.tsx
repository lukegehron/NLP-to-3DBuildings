import { useMemo } from "react";
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

  const component = useStorage((root) => root.components?.get(uuid));

  const [position, rotation, scale] = useMemo(() => {
    if (selTransform && isValidMatrix(selTransform)) {
      // @ts-expect-error
      const matrix = new Matrix4().fromArray(selTransform);

      let p = new Vector3();
      let r = new Quaternion();
      let s = new Vector3();
      matrix.decompose(p, r, s);
      matrix.decompose(p, r, s);

      let euler = new Euler().setFromQuaternion(r);

      return [p, euler, s];
    } else {
      const position = component.props.position;
      const rotation = component.props.rotation;
      const scale = component.props.scale;
      return [position, rotation, scale];
    }
  }, [uuid, selTransform]);

  return {
    position,
    rotation,
    scale,
  };
};
