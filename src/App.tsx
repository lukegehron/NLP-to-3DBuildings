import { useRef, useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrthographicCamera, PerspectiveCamera } from "@react-three/drei";
import { Matrix4 } from "three";
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
  useStorage,
} from "@liveblocks/react";
import {
  TransformControlsProvider,
  useTransformControlsProvider,
} from "./hooks/TransformControlsProvider";
import { useLiveblocksState } from "./hooks/useLivblocksState";
import { funName, roomName, stringToColor } from "./utils/nameGenerator";
import { useTransformState } from "./hooks/useTransformState";
import { PresenceOutlines } from "./components/PresenceOutlines";

function BoxMesh({ path }: { path?: string[] }) {
  const { state } = useLiveblocksState({ path });
  const { setSelectedObject } = useTransformControlsProvider();
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
      // matrix is auto updated by transform controls
      // matrixAutoUpdate={false}
      // matrix={matrix}
      onClick={() => {
        setSelectedObject(path);
      }}
    >
      <boxGeometry {...geometry} />
      <meshStandardMaterial {...material} />
    </mesh>
  );
}

function ObjectScene({ path }: { path?: string[] }) {
  const state = useStorage((root) => {
    const rootObject = root.object;

    if (!rootObject) {
      return null;
    }

    let object = null;

    if (!path) {
      object = rootObject;
    } else if (path) {
      // @ts-expect-error
      let children = rootObject.get("children");

      for (let key of path) {
        if (!children) {
          break;
        }
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

  const { children, type } = state;

  switch (type) {
    case "Mesh": {
      return <BoxMesh key={path?.join(".")} path={path} />;
    }
    default: {
      return (
        <>
          {children &&
            Array.from(children, ([key]) => {
              return (
                <ObjectScene key={key} path={path ? [...path, key] : [key]} />
              );
            })}
        </>
      );
    }
  }
}

const Scene = () => {
  const [isOrtho, _setIsOrtho] = useState(true);

  return (
    <>
      <ambientLight intensity={0.75} color={0xffffff} />
      <pointLight position={[10, 10, 10]} />
      <ObjectScene />
      <PresenceOutlines />
      {isOrtho ? (
        <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={50} />
      ) : (
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={75} />
      )}
    </>
  );
};

function App() {
  const transformControlRef = useRef();

  const name = funName();
  const color = stringToColor(name);

  const [room, _setRoom] = useState(
    window.location.pathname.split("/").pop() ?? roomName()
  );

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
          geometries: {},
          materials: {},
          object: {},
          metadata: {
            generator: "threejs",
            type: "scene",
            version: 1,
          },
        }}
      >
        <ClientSideSuspense fallback={<div>Loading…</div>}>
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
              <Scene />
            </TransformControlsProvider>
          </Canvas>
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}

export default App;
