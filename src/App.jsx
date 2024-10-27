import { useCallback, useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  GizmoHelper,
  GizmoViewcube,
  Grid,
  OrthographicCamera,
  PerspectiveCamera,
  OrbitControls,
} from "@react-three/drei";
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react";
import {
  TransformControlsProvider,
  // TransformControlsProviderRef,
} from "./providers/TransformControlsProvider.jsx";
// import { PresenceOutlines } from "./components/PresenceOutlines.js";
import { CommandBarProvider } from "./providers/CommandBarProvider.jsx";
import { LiveMap } from "@liveblocks/client";
import { KeyboardControlsProvider } from "./providers/KeyboardControlsProvder.jsx";
import { useRoomRoute } from "./hooks/useRoomRoute.js";
import { SceneRenderer } from "./components/SceneRenderer.jsx";
import { useName } from "./hooks/useName.js";
import { Leva } from "leva";
import { Building } from "./elements/Building.jsx";
import {
  buildingDataAtom,
  scaleXAtom,
  scaleYAtom,
  scaleZAtom,
  buildingPromptAtom,
  aiPromptAtom,
} from "./utils/atom";
import { useAtom } from "jotai";
import Chatbox from "./components/Chatbox.jsx";
// import { loadOBJModel } from "./utils/file.js";
import { useLoader } from "@react-three/fiber";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import OpenAI from "openai";
import { MeshStandardMaterial } from "three";
import { randomColor } from "./utils/randomColor.ts";

// main();

const buildingData = {
  building: {
    id: "building_001",
    name: "Main Office Building",
    geoJSON: [
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [0, 0],
              [100, 0],
              [100, 100],
              [0, 100],
              [0, 0],
            ],
          ],
        },
        properties: {
          name: "Main Office Building Footprint",
        },
      },
    ],
    floors: [
      {
        id: "floor_1",
        name: "Ground Floor",
        geoJSON: [
          {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [0, 0],
                  [100, 0],
                  [100, 100],
                  [0, 100],
                  [0, 0],
                ],
              ],
            },
            properties: {
              name: "Ground Floor Outline",
            },
          },
        ],
        spaces: [
          {
            id: "space_101",
            name: "Reception",
            geoJSON: [
              {
                type: "Feature",
                geometry: {
                  type: "Polygon",
                  coordinates: [
                    [
                      [0, 0],
                      [20, 0],
                      [20, 30],
                      [0, 30],
                      [0, 0],
                    ],
                  ],
                },
                properties: {
                  name: "Reception Area",
                },
              },
            ],
          },
          {
            id: "space_102",
            name: "Meeting Room 1",
            geoJSON: [
              {
                type: "Feature",
                geometry: {
                  type: "Polygon",
                  coordinates: [
                    [
                      [25, 0],
                      [50, 0],
                      [50, 25],
                      [25, 25],
                      [25, 0],
                    ],
                  ],
                },
                properties: {
                  name: "Meeting Room 1",
                },
              },
            ],
          },
        ],
      },
    ],
  },
};

const Scene = () => {
  const [isOrtho, _setIsOrtho] = useState(true);
  const objUrl =
    // "https://raw.githubusercontent.com/mrdoob/three.js/refs/heads/dev/examples/models/obj/tree.obj";
    "./test.obj";
  const obj = useLoader(OBJLoader, objUrl);

  const [material] = useState(
    () =>
      new MeshStandardMaterial({
        color: 0xff0000,
        roughness: 0.5,
        metalness: 0.5,
      })
  );

  useEffect(() => {
    if (obj) {
      obj.traverse((child) => {
        if (child.isMesh) {
          child.material = new MeshStandardMaterial({
            // map: texture,
            color: randomColor(),
            roughness: 0.5,
            metalness: 0.5,
          });
        }
      });
    }
    console.log(obj);
  }, [obj]);

  return (
    <>
      <SceneRenderer />
      {/* <PresenceOutlines /> */}
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
      {/* <GizmoHelper alignment="top-left" margin={[80, 80]}>
        <GizmoViewcube />
      </GizmoHelper> */}
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
      {/* {obj && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <primitive object={obj} />
          <meshStandardMaterial
            color={0xff0000}
            roughness={0.5}
            metalness={0.5}
          />
        </mesh>
      )} */}
    </>
  );
};

function App() {
  const room = useRoomRoute();
  const [buildingData, setBuildingData] = useAtom(buildingDataAtom);
  const [scaleX, setScaleX] = useAtom(scaleXAtom);
  const [scaleY, setScaleY] = useAtom(scaleYAtom);
  const [scaleZ, setScaleZ] = useAtom(scaleZAtom);
  const [buildingPrompt, setBuildingPrompt] = useAtom(buildingPromptAtom);
  const [aiPrompt, setAiPrompt] = useAtom(aiPromptAtom);

  const handleScaleXChange = (event) => {
    const { name, value } = event.target;
    setScaleX(parseFloat(value));
  };

  const handleScaleYChange = (event) => {
    const { name, value } = event.target;
    setScaleY(parseFloat(value));
  };

  const handleScaleZChange = (event) => {
    const { name, value } = event.target;
    setScaleZ(parseFloat(value));
  };

  // Reference to the imperative api provided by TransformControlsProvider
  const transformControlRef = useRef();

  const { name, color } = useName();

  const setMode = useCallback((mode) => {
    transformControlRef.current?.setMode(mode);
  }, []);

  const getFloorName = (index) => {
    const floorNames = ["Ground", "First", "Second", "Third", "Fourth"];
    return floorNames[index] || `Floor ${index + 1}`;
  };

  const handleBuildingChange = (event) => {
    const { name, value } = event.target;
    setBuildingData((prevData) => {
      const updatedBuilding = { ...prevData.building };

      if (name === "floorCount") {
        const newFloorCount = parseInt(value, 10);
        const currentFloors = updatedBuilding.floors || [];

        if (newFloorCount > currentFloors.length) {
          // Duplicate the last floor if available, otherwise create a new floor
          const floorToDuplicate =
            currentFloors[currentFloors.length - 1] ||
            {
              /* default floor structure */
            };
          updatedBuilding.floors = [
            ...currentFloors,
            ...Array(newFloorCount - currentFloors.length)
              .fill()
              .map((_, index) => ({
                ...floorToDuplicate,
                id: `floor_${currentFloors.length + index + 1}`,
                name: getFloorName(currentFloors.length + index),
              })),
          ];
        } else {
          updatedBuilding.floors = currentFloors.slice(0, newFloorCount);
        }
      } else if (name === "floorHeight") {
        updatedBuilding.floorHeight = parseFloat(value);
      }

      console.log(updatedBuilding);
      return { ...prevData, building: updatedBuilding };
    });
  };

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
        <ClientSideSuspense
          fallback={
            <div className="flex justify-center items-center w-screen h-screen">
              Loading…
            </div>
          }
        >
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
              <ambientLight />
              <KeyboardControlsProvider>
                <TransformControlsProvider ref={transformControlRef}>
                  <Scene />
                </TransformControlsProvider>
              </KeyboardControlsProvider>
              {/* <Building buildingData={buildingData} /> */}
            </Canvas>
            {/* Chatbox Component */}
            <Chatbox />
            <div className="building-parameters-box absolute top-0 left-0 w-[300px] bg-black/50 pointer-events-none">
              <div className="pointer-events-auto p-4">
                <label htmlFor="floorSlider" className="block text-white mb-2">
                  Number of Floors:
                </label>
                <input
                  id="floorSlider"
                  name="floorCount"
                  type="range"
                  min="1"
                  max="5"
                  value={buildingData?.building?.floors?.length || 1}
                  onChange={handleBuildingChange}
                  className="w-full"
                />
                <p className="text-white">
                  Current Floors: {buildingData?.building?.floors?.length || 0}
                </p>

                <label
                  htmlFor="floorHeightSlider"
                  className="block text-white mb-2 mt-4"
                >
                  Floor Height:
                </label>
                <input
                  id="floorHeightSlider"
                  name="floorHeight"
                  type="range"
                  min="2"
                  max="5"
                  step="0.1"
                  value={buildingData?.building?.floorHeight || 3}
                  onChange={handleBuildingChange}
                  className="w-full"
                />
                <p className="text-white">
                  Floor Height:{" "}
                  {buildingData?.building?.floorHeight?.toFixed(1) || 3} m
                </p>

                <p className="text-white">
                  Building Name: {buildingData?.building?.name}
                </p>
                <p className="text-white">
                  Building Type: {buildingData?.building?.type}
                </p>
                {/* <p className="text-white">
                  Building Offset: {buildingData?.building?.offset}
                </p> */}
                {/* scale x scale y scale z */}
                <label htmlFor="scaleX" className="block text-white mb-2">
                  Scale X:
                </label>
                <input
                  id="scaleX"
                  name="scaleX"
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.01"
                  value={scaleX || 0.3}
                  onChange={handleScaleXChange}
                />

                <label htmlFor="scaleY" className="block text-white mb-2">
                  Scale Z:
                </label>
                <input
                  id="scaleY"
                  name="scaleY"
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.01"
                  value={scaleY || 0.3}
                  onChange={handleScaleYChange}
                />
                <label htmlFor="scaleZ" className="block text-white mb-2">
                  Scale Y:
                </label>
                <input
                  id="scaleZ"
                  name="scaleZ"
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.01"
                  value={scaleZ || 0.3}
                  onChange={handleScaleZChange}
                />
                {/* <button
                  onClick={() => (
                    console.log("do this"), main(aiPrompt, buildingPrompt)
                  )}
                >
                  Generate Building
                </button> */}
              </div>
            </div>
          </CommandBarProvider>
        </ClientSideSuspense>
        {/* <Leva
          titleBar={{
            title: "Buildosaur",
          }}
        /> */}
      </RoomProvider>
    </LiveblocksProvider>
  );
}

export default App;
