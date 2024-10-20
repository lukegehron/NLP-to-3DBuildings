import { LiveMap, Lson } from "@liveblocks/client";
import {
  BufferGeometryJSON,
  MaterialJSON,
  SceneJSON,
  SceneJSONObject,
} from "three";

// take a three js scene as json and return a liveblocks storage object
// child objects, meshes and materials should be individually addressable by liveblocks
// will probably end up making special components for these elements
export const sceneMetaToStorage = (
  scene: SceneJSON & {
    geometries: BufferGeometryJSON[];
    materials: MaterialJSON[];
    metadata: {
      generator: string;
      type: string;
      version: number;
    };
  }
) => {
  const liveObject = new LiveMap();

  console.log(scene);

  Object.keys(scene).forEach((key) => {
    switch (key) {
      case "geometries":
        createLiveObjectGeometries(scene.geometries, liveObject);
        break;
      case "materials":
        createLiveObjectMaterials(scene.materials, liveObject);
        break;
      case "object":
        createLiveObjectObjects(scene.object, liveObject);
        break;
      case "metadata":
        liveObject.set("metadata", scene.metadata);
        break;
      default:
        break;
    }
  });

  return liveObject;
};

// this will be called recursively on object / object.children
export const createLiveObjectGeometries = (
  geometries: BufferGeometryJSON[]
) => {
  const lGeometries = new LiveMap<string, Lson>();

  geometries.forEach((geometry) => {
    const lGeometry = new LiveMap<string, Lson>(Object.entries(geometry));
    lGeometries.set(geometry.uuid, lGeometry);
  });
  return lGeometries;
};

export const createLiveObjectMaterials = (materials: MaterialJSON[]) => {
  const lMaterials = new LiveMap<string, Lson>();

  materials.forEach((material) => {
    const lMaterial = new LiveMap<string, Lson>(Object.entries(material));
    lMaterials.set(material.uuid, lMaterial);
  });
  return lMaterials;
};

export const createLiveObjectObjects = (
  object: SceneJSONObject,
  liveObject: LiveMap<string, Lson>
) => {
  const entries = Object.entries(object).filter(([key]) => key !== "children");
  const lObject = new LiveMap<string, Lson>(entries);

  liveObject.set("object", lObject);

  const children = object.children;

  // base case for recursion
  if (!children) {
    return;
  }

  const lChildren = new LiveMap<string, Lson>();
  lObject.set("children", lChildren);

  children.forEach((object) => {
    // @ts-expect-error
    const uuid = object.uuid;
    // @ts-expect-error
    const child = createLiveObjectObject3d(object);
    lChildren.set(uuid, child);
  });
};

export const createLiveObjectObject3d = (object: SceneJSONObject) => {
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
    const child = createLiveObjectObject3d(object);
    lChildren.set(uuid, child);
  });

  return lObject;
};
