import { useRef, useState, useEffect, useCallback } from "react";
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
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react";
import {
  TransformControlsProvider,
  useTransformControls,
} from "./hooks/TransformControlsProvider";
import { funName, roomName, stringToColor } from "./utils/nameGenerator";
import { PresenceOutlines } from "./components/PresenceOutlines";
import { CommandBarProvider } from "./components/ui/CommandBarContext";
import { LiveMap } from "@liveblocks/client";
import { KeyboardControlsProvider } from "./hooks/KeyboardControlsProvder";
import { useSceneState } from "./hooks/useSceneState";
import { ComponentRegistry } from "./elements/ComponentRegistry";
import { useTransformState } from "./hooks/useTransformState";
import { SceneComponentData } from "./types";

const SceneNode = ({ node }: { node: any }) => {
  // @ts-expect-error
  const Component = ComponentRegistry[node.type];

  const { setSelectedId } = useTransformControls();

  const { position, rotation, scale } = useTransformState(node.id);

  if (!Component) return null;

  return (
    <Component
      {...node.props}
      position={position}
      rotation={rotation}
      scale={scale}
      uuid={node.id}
      onClick={() => {
        setSelectedId(node.id);
      }}
    >
      {node.children?.map((child: SceneComponentData) => (
        <SceneNode key={child.id} node={child} />
      ))}
    </Component>
  );
};

export const SceneRenderer = () => {
  const { sceneGraph } = useSceneState();

  if (!sceneGraph) return null;

  return (
    <>
      {sceneGraph.map((node) => (
        <SceneNode key={node.id} node={node} />
      ))}
    </>
  );
};

const Scene = () => {
  const [isOrtho, _setIsOrtho] = useState(true);

  return (
    <>
      <Environment preset="city" />
      <SceneRenderer />
      <PresenceOutlines />
      {isOrtho ? (
        <OrthographicCamera
          makeDefault
          position={[-10, 30, -10]}
          zoom={20}
          near={-100}
        />
      ) : (
        <PerspectiveCamera makeDefault position={[5, 9, 5]} fov={50} />
      )}
      <GizmoHelper alignment="top-right" margin={[80, 80]}>
        <GizmoViewcube />
      </GizmoHelper>
      <ContactShadows
        opacity={0.55}
        width={4}
        height={4}
        scale={20}
        blur={0.75}
        far={10}
        resolution={1024}
        color="#000000"
      />
      <Grid
        position={[0, -0.1, 0]}
        args={[10.5, 10.5]}
        cellSize={0.6}
        cellThickness={1}
        cellColor={"#6f6f6f"}
        sectionSize={3.3}
        sectionThickness={1.25}
        sectionColor={"#6699FF"}
        fadeDistance={50}
        fadeStrength={1}
        followCamera={true}
        infiniteGrid={true}
      />
    </>
  );
};

function App() {
  const transformControlRef = useRef<{ deselect: () => void }>();

  const name = funName();
  const color = stringToColor(name);

  const [room, _setRoom] = useState(() => {
    const path = window.location.pathname;
    const roomPath = path.replace(/^\/buildosaur\/?/, "");
    return roomPath || roomName();
  });

  const navigateHandler = useCallback(() => {
    const path = window.location.pathname;
    const roomPath = path.replace(/^\/buildosaur\/?/, "");
    if (roomPath) {
      _setRoom(roomPath);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("popstate", navigateHandler);
    return () => {
      window.removeEventListener("popstate", navigateHandler);
    };
  }, [navigateHandler]);

  useEffect(() => {
    const path = window.location.pathname;
    const roomPath = path.replace(/^\/buildosaur\/?/, "");
    if (!roomPath) {
      window.history.pushState({}, "", `/buildosaur/${room}`);
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
          selected: null,
          selectedTransform: null,
        }}
        initialStorage={{
          components: new LiveMap(),
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
              raycaster={{
                near: 0.01,
                far: 100,
              }}
              onPointerMissed={() => {
                console.log("pointer missed");
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
