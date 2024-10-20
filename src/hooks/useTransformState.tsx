import { useMemo } from "react";
import { isValidMatrix, useLiveblocksState } from "./useLivblocksState";
import { Euler, Matrix4, Quaternion, Vector3 } from "three";

export const useTransformState = ({ path }: { path?: string[] }) => {
  const { state, ephemeralTransformMap } = useLiveblocksState({ path });

  const selTransform = useMemo(() => {
    if (!path) {
      return null;
    }
    const uuid = path[path.length - 1];
    const item = ephemeralTransformMap.find(([_k, val]) => val.sel === uuid);
    if (!item) {
      return null;
    }
    return item[1].selTransform;
  }, [path, ephemeralTransformMap]);

  const object = useMemo(() => {
    if (!state) {
      return null;
    }

    const { object: _object } = state;

    if (!_object) {
      return null;
    }

    return Object.fromEntries(_object.entries());
  }, [state]);

  const [position, rotation, scale] = useMemo(() => {
    const _matrix = selTransform ?? object?.["matrix"];
    const matrix = new Matrix4();
    if (matrix && isValidMatrix(_matrix)) {
      matrix.fromArray(_matrix);
    }

    let p = new Vector3();
    let r = new Quaternion();
    let s = new Vector3();
    matrix.decompose(p, r, s);

    let euler = new Euler().setFromQuaternion(r);

    return [p, euler, s];
  }, [object]);

  return {
    position,
    rotation,
    scale,
  };
};
