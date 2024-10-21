import { useRef, useState, useMemo, useEffect, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  GizmoHelper,
  GizmoViewcube,
  Grid,
  OrthographicCamera,
  PerspectiveCamera,
} from "@react-three/drei";
import { Matrix4 } from "three";
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
  useStorage,
} from "@liveblocks/react";
import {
  TransformControlsProvider,
  useTransformControls,
} from "./hooks/TransformControlsProvider";
import { useLiveblocksState } from "./hooks/useLivblocksState";
import { funName, roomName, stringToColor } from "./utils/nameGenerator";
import { useTransformState } from "./hooks/useTransformState";
import { PresenceOutlines } from "./components/PresenceOutlines";
import { CommandBarProvider } from "./components/ui/CommandBarContext";
import { LiveMap } from "@liveblocks/client";
import { KeyboardControlsProvider } from "./hooks/KeyboardControlsProvder";

function BoxMesh({ path }: { path?: string[] }) {
  const { state } = useLiveblocksState({ path });
  const { setSelectedObject } = useTransformControls();
  const { position, rotation, scale } = useTransformState({ path });

  const { geometry, material, object } = useMemo(() => {
    if (!state) {
      return {
        geometry: null,
        material: null,
        object: null,
      };
    }

    const { geometry, material, object } = state;

    return {
      geometry: Object.fromEntries(geometry.entries()),
      material: Object.fromEntries(material.entries()),
      object: Object.fromEntries(object.entries()),
    };
  }, [state]);

  if (!state) {
    return <></>;
  }

  return (
    <mesh
      // important to keep three js scene uuid in line with stored uuid in liveblocks
      uuid={object?.uuid}
      // onUpdate function is called every time the mesh matrix is updated
      // onUpdate={(self) => { }}
      up={object?.up}
      position={position}
      rotation={rotation}
      scale={scale}
      receiveShadow={true}
      castShadow={true}
      // matrix is auto updated by transform controls
      // matrixAutoUpdate={false}
      // matrix={matrix}
      onClick={() => {
        setSelectedObject(path);
      }}
    >
      <boxGeometry {...geometry} />
      {material && material.type === "MeshBasicMaterial" && (
        <meshBasicMaterial {...material} />
      )}
      {material && material.type === "MeshStandardMaterial" && (
        <meshStandardMaterial {...material} />
      )}
    </mesh>
  );
}

function ObjectRecursive({ path }: { path?: string[] }) {
  const state = useStorage((root) => {
    const rootObject = root.object;

    if (!rootObject) {
      return null;
    }

    let object = null;

    if (!path) {
      object = rootObject;
    } else if (path) {
      let children = rootObject;

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
          object = child;
        } else {
          children = child.get("children");
        }
      }
    }

    if (!object || !object.get) {
      return null;
    }

    return {
      type: object.get("type"),
      children: object.get("children"),
    };
  });

  if (!state) {
    return null;
  }

  const uuid = path?.[path.length - 1];
  const { children, type } = state;

  switch (type) {
    case "Mesh": {
      return <BoxMesh key={path?.join(".")} path={path} />;
    }
    case "Object3D": {
      return (
        <object3D key={path?.join(".")} uuid={uuid}>
          {children &&
            Array.from(children, ([key]) => {
              return (
                <ObjectRecursive
                  key={key}
                  path={path ? [...path, key] : [key]}
                />
              );
            })}
        </object3D>
      );
    }
    default: {
      return (
        <>
          {children &&
            Array.from(children, ([key]) => {
              return (
                <ObjectRecursive
                  key={key}
                  path={path ? [...path, key] : [key]}
                />
              );
            })}
        </>
      );
    }
  }
}

function ObjecScene() {
  const state = useStorage((root) => {
    // @ts-expect-error
    return Array.from(root.object.keys()) as string[];
  });

  return (
    <>
      {state?.map((key: string) => {
        return <ObjectRecursive key={key} path={[key]} />;
      })}
    </>
  );
}

const Scene = () => {
  const [isOrtho, _setIsOrtho] = useState(true);

  return (
    <>
      <Environment preset="city" />
      <ObjecScene />
      <PresenceOutlines />
      {isOrtho ? (
        <OrthographicCamera
          makeDefault
          position={[5, 5, 5]}
          zoom={50}
          near={-100}
        />
      ) : (
        <PerspectiveCamera makeDefault position={[5, 9, 5]} fov={50} />
      )}
      <GizmoHelper alignment="top-right" margin={[80, 80]}>
        <GizmoViewcube />
      </GizmoHelper>
      <ContactShadows
        opacity={0.5}
        scale={10}
        blur={3}
        far={10}
        resolution={256}
        color="#000000"
      />
      <Grid
        position={[0, -0.1, 0]}
        args={[10.5, 10.5]}
        cellSize={0.6}
        cellThickness={1}
        cellColor={"#6f6f6f"}
        sectionSize={3.3}
        sectionThickness={1.5}
        sectionColor={"#6699FF"}
        fadeDistance={50}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={true}
      />
    </>
  );
};

function App() {
  const transformControlRef = useRef();

  const name = funName();
  const color = stringToColor(name);

  const [room, _setRoom] = useState(
    window.location.pathname.split("/").pop() || roomName()
  );

  const navigateHandler = useCallback(() => {
    const roomName = window.location.pathname.split("/").pop();
    if (roomName) {
      _setRoom(roomName);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("popstate", navigateHandler);

    return () => {
      window.removeEventListener("popstate", navigateHandler);
    };
  }, [navigateHandler]);

  useEffect(() => {
    const currRoomName = window.location.pathname.split("/").pop();
    if (!currRoomName) {
      window.history.pushState({}, "", room);
    }
  }, [room]);

  return (
    <LiveblocksProvider
      publicApiKey={
        "pk_dev_htKIDdGmC1jqqOdbfluugd6BlHq-qrzbT5z45Mhmn7Xq-85gv_BrSlgizxlTTyDt"
      }
    >
      <RoomProvider
        id={room}
        initialPresence={{
          name,
          color,
          selected: [],
          selectedTransform: new Matrix4().toArray(),
        }}
        initialStorage={{
          geometries: new LiveMap(),
          materials: new LiveMap(),
          object: new LiveMap(),
          metadata: {
            generator: "threejs",
            type: "scene",
            version: 1,
          },
        }}
      >
        <ClientSideSuspense fallback={<div>Loading…</div>}>
          <CommandBarProvider>
            <Canvas
              style={{
                width: "100vw",
                height: "100vh",
                display: "block",
                position: "absolute",
                top: 0,
                left: 0,
              }}
              onPointerMissed={() => {
                // @ts-expect-error
                transformControlRef.current?.deselect();
              }}
            >
              <TransformControlsProvider ref={transformControlRef}>
                <KeyboardControlsProvider>
                  <Scene />
                </KeyboardControlsProvider>
              </TransformControlsProvider>
            </Canvas>
          </CommandBarProvider>
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}

export default App;
