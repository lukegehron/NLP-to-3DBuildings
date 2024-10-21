import { useSelf } from "@liveblocks/react";
import React, { useContext, useEffect } from "react";
import { useAddObjects } from "./useObjects";
import { useTransformControls } from "./TransformControlsProvider";

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
  const selfSelected = useSelf((s) => s.presence.selected);
  const { setSelectedObject } = useTransformControls();

  const { deleteObject } = useAddObjects();

  useEffect(() => {
    const handler = (window.onkeydown = (e) => {
      switch (e.key) {
        case "Backspace":
        case "Delete":
          // deselect object so that transform controls
          // doesn't complain when object is removed from scene
          setSelectedObject(undefined);
          // @ts-expect-error
          deleteObject(selfSelected);
          break;
        default:
          // console.log(e.key);
          break;
      }
    });

    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [selfSelected]);

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
