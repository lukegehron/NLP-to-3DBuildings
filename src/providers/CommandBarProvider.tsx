import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  CommandDialog,
  CommandInput,
  CommandItem,
  CommandList,
  CommandGroup,
} from "../components/ui/CommandBar";
import { useSceneState } from "../hooks/useSceneState";
import { randomColor } from "../utils/randomColor";
import {
  ArrowClockwise,
  ArrowsAngleExpand,
  ArrowsMove,
  Box,
} from "react-bootstrap-icons";

interface CommandBarState {
  foo?: string;
}

const DEFAULT_PREFERENCES: CommandBarState = {
  foo: undefined,
};

interface CommandBarContextValue {
  toggleCommandBar: (open?: boolean) => void;
  cBarState: typeof DEFAULT_PREFERENCES;
  setCBarState: (preferences: Partial<typeof DEFAULT_PREFERENCES>) => void;
}

const Context = React.createContext<CommandBarContextValue>(
  {} as CommandBarContextValue
);

interface CommandBarProviderProps {
  setMode: (mode: "translate" | "rotate" | "scale") => void;
  children?: React.ReactNode;
}

export const CommandBarProvider = ({
  setMode,
  children,
}: CommandBarProviderProps): React.ReactElement => {
  const [open, setOpen] = React.useState(false);

  // Toggle command bar with keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const toggleCommandBar = useCallback(
    (open?: boolean) =>
      setOpen((o) => {
        return typeof open === "boolean" ? open : !o;
      }),
    []
  );

  const [cBarState, setCBarState] = useState(DEFAULT_PREFERENCES);

  const { addComponent } = useSceneState();

  return (
    <Context.Provider
      value={{
        toggleCommandBar,
        cBarState,
        setCBarState,
      }}
    >
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandGroup heading="Transform Mode">
            <CommandItem
              key={"toggle-transform-translate"}
              onSelect={() => {
                setMode("translate");
                setOpen(false);
              }}
              className="hover:bg-gray-100 p-2 rounded-md flex gap-2 text-black"
            >
              <ArrowsMove /> Translate
            </CommandItem>
            <CommandItem
              key={"toggle-transform-rotate"}
              onSelect={() => {
                setMode("rotate");
                setOpen(false);
              }}
              className="hover:bg-gray-100 p-2 rounded-md flex gap-2 text-black"
            >
              <ArrowClockwise /> Rotate
            </CommandItem>
            <CommandItem
              key={"toggle-transform-scale"}
              onSelect={() => {
                setMode("scale");
                setOpen(false);
              }}
              className="hover:bg-gray-100 p-2 rounded-md flex gap-2 text-black"
            >
              <ArrowsAngleExpand /> Scale
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Add Element">
            <CommandItem
              key={"create-box"}
              onSelect={() => {
                addComponent({
                  type: "Box",
                  props: {
                    color: randomColor(),
                    position: [0, 3, 0],
                    rotation: [0, 0, 0, "XYZ"],
                    scale: [1, 1, 1],
                    width: 1,
                    height: 1,
                    length: 10,
                  },
                });
                setOpen(false);
              }}
              className="hover:bg-gray-100 p-2 rounded-md flex gap-2 text-black"
            >
              <Box /> Add Box
            </CommandItem>
            <CommandItem
              key={"create-wbeam"}
              onSelect={() => {
                addComponent({
                  type: "WBeam",
                  props: {
                    color: randomColor(),
                    position: [0, 3, 0],
                    rotation: [0, 0, 0, "XYZ"],
                    scale: [1, 1, 1],
                  },
                });
                setOpen(false);
              }}
              className="hover:bg-gray-100 p-2 rounded-md flex gap-2 text-black"
            >
              <Box /> Add Wide Flange Beam
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
      {children}
    </Context.Provider>
  );
};

export const useCommandBar = (): CommandBarContextValue => {
  return useContext(Context);
};
