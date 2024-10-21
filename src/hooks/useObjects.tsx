import { LiveMap, Lson } from "@liveblocks/client";
import { useMutation } from "@liveblocks/react";
import { useCallback } from "react";
import * as THREE from "three";
import { createLiveObject3d } from "../utils/state";
import { randomColor } from "../utils/randomColor";

export const useAddObjects = () => {
  // const { scene } = useThree();
  const addObject = useMutation(({ storage }, partialObject: any) => {
    partialObject.geometries.forEach((geometry: any) => {
      const geo = storage.get("geometries");
      // @ts-expect-error
      if (!geo || typeof geo.set !== "function") {
        return;
      }
      // @ts-expect-error
      geo.set(
        geometry.uuid,
        new LiveMap<string, Lson>(Object.entries(geometry))
      );
    });

    partialObject.materials.forEach((material: any) => {
      const mat = storage.get("materials");
      // @ts-expect-error
      if (!mat || typeof mat.set !== "function") {
        return;
      }
      // @ts-expect-error
      mat.set(
        material.uuid,
        new LiveMap<string, Lson>(Object.entries(material))
      );
    });

    const lObject = createLiveObject3d(partialObject.object);
    const object = storage.get("object");

    // @ts-expect-error
    if (!object || typeof object.set !== "function") {
      return;
    }
    // @ts-expect-error
    object.set(partialObject.object.uuid, lObject);
  }, []);

  const deleteObject = useMutation(({ storage }, path: string[]) => {
    let children = storage.get("object");
    // let objectToDelete;
    let materialUUID, geometryUUID;

    for (let key of path) {
      if (!children) {
        break;
      }
      // @ts-expect-error
      const child = children.get(key);
      if (!child) {
        break;
      }

      if (child.get("uuid") === path[path.length - 1]) {
        materialUUID = child.get("material");
        geometryUUID = child.get("geometry");
        // @ts-expect-error
        children.delete(key);
      } else {
        children = child.get("children");
      }
    }

    if (materialUUID) {
      // @ts-expect-error
      storage.get("materials").delete(materialUUID);
    }

    if (geometryUUID) {
      // @ts-expect-error
      storage.get("geometries").delete(geometryUUID);
    }
  }, []);

  const addBox = useCallback(
    ({
      geometryParams = {
        width: 10,
        height: 10,
        depth: 10,
        widthSegments: 1,
        heightSegments: 1,
        depthSegments: 1,
      },
      materialParams,
    }: {
      geometryParams?: {
        width?: number;
        height?: number;
        depth?: number;
        widthSegments?: number;
        heightSegments?: number;
        depthSegments?: number;
      };
      materialParams?: {
        color?: THREE.ColorRepresentation | undefined;
        opacity?: number | undefined;
      };
    }) => {
      const newObj = new THREE.Object3D();
      const newBoxGeometry = new THREE.BoxGeometry(
        ...Object.values(geometryParams)
      );
      const color = randomColor();
      const newBoxMaterial = new THREE.MeshStandardMaterial({
        color,
        opacity: 1.0,
        ...materialParams,
      });
      const newMesh = new THREE.Mesh(newBoxGeometry, newBoxMaterial);
      newMesh.castShadow = true;
      newMesh.receiveShadow = true;
      newMesh.position.set(0, 1, 0);
      newMesh.updateMatrix();
      newObj.add(newMesh);
      const jsonObj = newObj.toJSON();
      addObject(jsonObj);
    },
    []
  );

  return { addBox, deleteObject };
};
