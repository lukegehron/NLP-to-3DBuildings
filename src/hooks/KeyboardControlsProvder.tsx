import { useRedo, useUndo } from "@liveblocks/react";
import React, { useContext, useEffect } from "react";
import { useTransformControls } from "./TransformControlsProvider";
import { useSceneState } from "./useSceneState";

interface KeyboardControlsValue {
  enabled: boolean;
}

const KeyboardControls = React.createContext<KeyboardControlsValue>(
  {} as KeyboardControlsValue
);

interface KeyboardControlsProviderProps {
  children?: React.ReactNode;
}

export const KeyboardControlsProvider = ({
  children,
}: KeyboardControlsProviderProps): React.ReactElement => {
  const { selectedId, setSelectedId } = useTransformControls();
  const { deleteComponent } = useSceneState();

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

export const useContextProvider = (): KeyboardControlsValue => {
  return useContext(KeyboardControls);
};
