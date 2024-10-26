import { LiveObject } from "@liveblocks/client";
import { useMutation, useStorage } from "@liveblocks/react";
import { v4 as uuidv4 } from "uuid";
import { allComponentsAtom } from "../utils/atom";
import { useSetAtom } from "jotai";
// import { ComponentProps, SceneComponentData } from "../types";

export const useSceneState = () => {
  // Read the flat component map from storage
  const components = useStorage((root) => root.components);
  const setAllComponents = useSetAtom(allComponentsAtom);

  // Get reconstructed scene graph
  const sceneGraph = useStorage((root) => {
    const components = root.components;
    if (!components) return null;

    const buildTree = (parentId) => {
      return Array.from(components.entries())
        .filter(([_, component]) => component.parentId === parentId)
        .map(([id, component]) => ({
          id,
          type: component.type,
          props: { ...component.props },
          children: buildTree(id),
        }));
    };

    return buildTree();
  });

  function handleAddComponent(component) {
    setAllComponents((prev) => [...prev, component]);
  }

  // Add a new component
  const addComponent = useMutation(({ storage }, { type, props, parentId }) => {
    const id = uuidv4();
    storage.get("components").set(
      id,
      new LiveObject({
        id,
        type,
        parentId,
        props: new LiveObject(props),
      })
    );
    handleAddComponent(id);
    return id;
  }, []);

  // Update component
  const updateComponent = useMutation(({ storage }, { id, props }) => {
    console.log({ id, props });
    const component = storage.get("components").get(id);
    if (component) {
      component.get("props").update(props);
    }
  }, []);

  // Delete component and its children
  const deleteComponent = useMutation(({ storage }, id) => {
    const components = storage.get("components");

    const deleteRecursive = (componentId) => {
      // Find and delete all children first
      Array.from(components.entries())
        .filter(([_, component]) => component.get("parentId") === componentId)
        .forEach(([childId]) => deleteRecursive(childId));

      // Delete the component itself
      components.delete(componentId);
    };

    deleteRecursive(id);
  }, []);

  // Move component to new parent
  const moveComponent = useMutation(({ storage }, { id, newParentId }) => {
    const component = storage.get("components").get(id);
    if (component) {
      component.set("parentId", newParentId);
    }
  }, []);

  return {
    components,
    sceneGraph,
    addComponent,
    updateComponent,
    deleteComponent,
    moveComponent,
  };
};
