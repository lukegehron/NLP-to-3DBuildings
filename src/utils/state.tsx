import { LiveMap, Lson } from "@liveblocks/client";
import { SceneJSONObject } from "three";

export const createLiveObject3d = (object: SceneJSONObject) => {
  const entries = Object.entries(object).filter(([key]) => key !== "children");
  const children = object.children;
  const lObject = new LiveMap<string, Lson>(entries);

  // base case for recursion
  if (!children) {
    return lObject;
  }

  const lChildren = new LiveMap<string, Lson>();
  lObject.set("children", lChildren);

  children.forEach((object) => {
    // @ts-expect-error
    const uuid = object.uuid;
    // @ts-expect-error
    const child = createLiveObject3d(object);
    lChildren.set(uuid, child);
  });

  return lObject;
};
