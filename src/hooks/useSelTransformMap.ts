import { useOthersMapped } from "@liveblocks/react";
import { Matrix4 } from "three";

export const useSelTransformMap = () => {
  const selTransformMap = useOthersMapped((others) => {
    return {
      sel: others.presence.selected,
      selTransform: others.presence.selectedTransform,
    };
  });

  return {
    selTransformMap,
  };
};

export const isValidMatrix = (matrix: any): matrix is Matrix4 => {
  return (
    Array.isArray(matrix) &&
    matrix.length === 16 &&
    matrix.every((v) => typeof v === "number") &&
    matrix.some((v) => v !== 0) &&
    matrix.every((v) => !isNaN(v))
  );
};
