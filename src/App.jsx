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
import { buildingDataAtom } from "./utils/atom";
import { useAtom } from "jotai";
import Chatbox from "./components/Chatbox.jsx";

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
    </>
  );
};

function App() {
  const room = useRoomRoute();
  const [buildingData, setBuildingData] = useAtom(buildingDataAtom);

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
              {/* <Building
                rotation={[-Math.PI / 2, 0, 0]}
                scale={[0.2, 0.2, 0.2]}
                buildingData={buildingData}
              /> */}
            </Canvas>
            {/* Chatbox Component */}
            <Chatbox />
            <div className="absolute top-0 left-0 w-[300px] bg-black/50 pointer-events-none">
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
                <p className="text-white">
                  Building Offset: {buildingData?.building?.offset}
                </p>
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
