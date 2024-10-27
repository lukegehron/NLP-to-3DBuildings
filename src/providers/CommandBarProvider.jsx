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
  Circle,
  Bricks,
  Grid3x3,
  Columns,
  Hammer,
  // Chair,
  // Table,
} from "react-bootstrap-icons";
import { buildingDataAtom } from "../utils/atom";
import { useAtom } from "jotai";

const DEFAULT_PREFERENCES = {
  foo: undefined,
};

const Context = React.createContext({});

export const CommandBarProvider = ({ setMode, children }) => {
  const [open, setOpen] = React.useState(false);
  const [buildingData] = useAtom(buildingDataAtom);
  // Toggle command bar with keyboard shortcut
  useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const toggleCommandBar = useCallback(
    (open) =>
      setOpen((o) => {
        return typeof open === "boolean" ? open : !o;
      }),
    []
  );

  const [cBarState, setCBarState] = useState(DEFAULT_PREFERENCES);

  const { addComponent } = useSceneState();

  const itemGroups = {
    "Platonic Elements": [
      {
        key: "box",
        label: "Box",
        icon: Box,
        type: "Box",
        dimensions: [1, 1, 1],
      },
      { key: "sphere", label: "Sphere", icon: Circle, type: "Sphere" },
    ],
    "Architectural Elements": [
      {
        key: "wall",
        label: "Wall",
        icon: Bricks,
        type: "Box",
        dimensions: [4, 3, 0.2],
      },
      {
        key: "floor",
        label: "Floor",
        icon: Grid3x3,
        type: "Box",
        dimensions: [4, 0.2, 4],
      },
    ],
    "Structural Elements": [
      {
        key: "column",
        label: "Column",
        icon: Columns,
        type: "Box",
        dimensions: [0.3, 3, 0.3],
      },
      { key: "beam", label: "Beam", icon: Hammer, type: "WBeam" },
    ],
    Furniture: [
      { key: "chair", label: "Chair", icon: Circle, type: "Chair" },
      { key: "table", label: "Table", icon: Circle, type: "Table" },
    ],
  };

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
          {Object.entries(itemGroups).map(([groupName, items]) => (
            <CommandGroup key={groupName} heading={groupName}>
              {items.map((item) => (
                <CommandItem
                  key={item.key}
                  onSelect={() => {
                    addComponent({
                      type: item.type,
                      props: {
                        color: randomColor(),
                        position: [0, 0, 0],
                        rotation: [0, 0, 0, "XYZ"],
                        scale: item.dimensions || [1, 1, 1],
                      },
                    });
                    setOpen(false);
                  }}
                  className="hover:bg-gray-100 p-2 rounded-md flex gap-2 text-black"
                >
                  <item.icon /> Add {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
      {children}
    </Context.Provider>
  );
};

export const useCommandBar = () => {
  return useContext(Context);
};
