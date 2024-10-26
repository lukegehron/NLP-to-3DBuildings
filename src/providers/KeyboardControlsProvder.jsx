import { useRedo, useUndo } from "@liveblocks/react";
import React, { useContext, useEffect, useState } from "react";
import { useTransformControls } from "./TransformControlsProvider.jsx";
import { useSceneState } from "../hooks/useSceneState.js";

const KeyboardControls = React.createContext({});

export const KeyboardControlsProvider = ({ children }) => {
  const { selectedId, setSelectedId } = useTransformControls();
  const { deleteComponent, addComponent, components } = useSceneState();

  const [copiedComponent, setCopiedComponent] =
    (useState < any) | (null > null);

  function getComponentById(id) {
    return components?.get(id);
  }

  const undo = useUndo();
  const redo = useRedo();

  useEffect(() => {
    const handler = (window.onkeydown = (e) => {
      switch (e.key) {
        case "z":
          if (e.ctrlKey || e.metaKey) {
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
          }

          break;
        case "Backspace":
        case "Delete":
          // deselect object so that transform controls
          // doesn't complain when object is removed from scene
          setSelectedId(null);
          if (!selectedId) return;
          deleteComponent(selectedId);
          break;
        case "c":
          if (e.ctrlKey || e.metaKey) {
            // Assuming you have a function getComponentById to fetch the component data
            const component = getComponentById(selectedId ?? "");
            if (component) {
              console.log("Copy action triggered", JSON.stringify(component));
            } else {
              console.log("Component not found for ID:", selectedId);
            }
            setCopiedComponent(component);
          }
          break;
        case "v":
          if (e.ctrlKey || e.metaKey) {
            // Handle paste logic here
            addComponent(JSON.parse(JSON.stringify(copiedComponent)));
            console.log("Paste action triggered");
          }
          break;
        default:
          // console.log(e.key);
          break;
      }
    });

    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [selectedId]);

  return (
    <KeyboardControls.Provider
      value={{
        enabled: true,
      }}
    >
      {children}
    </KeyboardControls.Provider>
  );
};

export const useContextProvider = () => {
  return useContext(KeyboardControls);
};
