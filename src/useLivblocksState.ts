import {
  useMutation,
  useOthersMapped,
  useStorage,
  useUpdateMyPresence,
} from "@liveblocks/react";
import isEqual from "lodash.isequal";
import { useState } from "react";

export const useLiveblocksState = ({ path: _path }: { path?: string[] }) => {
  const [path, setPath] = useState<string[] | undefined>(_path);

  const state = useStorage((root) => {
    const rootObject = root.object;

    if (!rootObject) {
      return null;
    }

    let object,
      material,
      geometry = null;

    if (!path) {
      return null;
    } else {
      // @ts-expect-error
      let children = rootObject.get("children");

      for (let key of path) {
        if (!children) {
          break;
        }
        const child = children.get(key);
        if (!child) {
          break;
        }

        if (child.get("uuid") === path[path.length - 1]) {
          object = child;
        } else {
          children = child.get("children");
        }
      }
    }

    if (!object) {
      return null;
    }

    const materialUUID = object.get("material");
    const geometryUUID = object.get("geometry");

    if (materialUUID) {
      // @ts-expect-error
      material = root.materials.get(materialUUID);
    }
    if (geometryUUID) {
      // @ts-expect-error
      geometry = root.geometries.get(geometryUUID);
    }

    return {
      geometry,
      material,
      object,
    };
  });

  const setState = useMutation(
    ({ storage }, partialObject: any) => {
      const rootObject = storage.get("object");

      if (!rootObject) {
        return;
      }

      let object;

      if (path) {
        // @ts-expect-error
        let children = rootObject.get("children");

        for (let key of path) {
          if (!children) {
            break;
          }
          const child = children.get(key);
          if (!child) {
            break;
          }

          if (child.get("uuid") === path[path.length - 1]) {
            object = child;
          } else {
            children = child.get("children");
          }
        }
      }

      if (object) {
        Object.entries(partialObject).forEach(([key, value]) => {
          const currVal = object.get(key);
          if (!isEqual(currVal, value)) {
            if (key === "matrix" && isValidMatrix(value)) {
              object.set(key, value);
            }
          }
        });
      }

      return;
    },
    [path]
  );

  const ephemeralTransformMap = useOthersMapped((others) => {
    if (
      others.presence.selected &&
      Array.isArray(others.presence.selected) &&
      others.presence.selected.length === 0
    ) {
      return {};
    }

    const sel =
      !others.presence.selected ||
      !Array.isArray(others.presence.selected) ||
      others.presence.selected.length === 0
        ? null
        : others.presence.selected[others.presence.selected.length - 1];

    return {
      sel,
      selTransform: others.presence.selectedTransform,
    };
  });

  const updateMyPresence = useUpdateMyPresence();

  return {
    state,
    setState,
    setPath,
    ephemeralTransformMap,
    updateMyPresence,
  };
};

export const isValidMatrix = (matrix: any) => {
  return (
    Array.isArray(matrix) &&
    matrix.length === 16 &&
    matrix.every((v) => typeof v === "number") &&
    matrix.some((v) => v !== 0) &&
    matrix.every((v) => !isNaN(v))
  );
};
