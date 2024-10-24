import { useCallback, useRef, useState } from "react";
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
  TransformControlsProviderRef,
} from "./providers/TransformControlsProvider";
import { PresenceOutlines } from "./components/PresenceOutlines";
import { CommandBarProvider } from "./providers/CommandBarProvider";
import { LiveMap } from "@liveblocks/client";
import { KeyboardControlsProvider } from "./providers/KeyboardControlsProvder";
import { useRoomRoute } from "./hooks/useRoomRoute";
import { SceneRenderer } from "./components/SceneRenderer";
import { useName } from "./hooks/useName";

const Scene = () => {
  const [isOrtho, _setIsOrtho] = useState(true);

  return (
    <>
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
      <Environment preset="city" />
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
  const room = useRoomRoute();

  // Reference to the imperative api provided by TransformControlsProvider
  const transformControlRef = useRef<TransformControlsProviderRef>();

  const { name, color } = useName();

  const setMode = useCallback((mode: "rotate" | "scale" | "translate") => {
    transformControlRef.current?.setMode(mode);
  }, []);

  return (
    <LiveblocksProvider
      publicApiKey={
        "pk_prod_v085z_GpDxTg8PAtMKyrha2aU098ApZq2Bs3QOEGlChBeQjejFXsG3mDxVoVfOxA"
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
          <CommandBarProvider setMode={setMode}>
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
