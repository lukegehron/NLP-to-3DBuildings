import { folder } from "leva";
import {
  // BaseComponentDefinition,
  createControlHandlers,
  // UpdateFunction,
} from "./ComponentRegistry";
import { Shape, Vector2 } from "three";
import { useState, useEffect } from "react";
import {
  buildingDataAtom,
  scaleXAtom,
  scaleYAtom,
  scaleZAtom,
} from "../utils/atom";
import { useAtom } from "jotai";

// Import a clipper library. For this example, we'll use 'clipper-lib'
import clipperLib from "clipper-lib";

export const Building = ({ color = "#cccccc", ...props }) => {
  const [buildingData] = useAtom(buildingDataAtom);
  const [scaleX] = useAtom(scaleXAtom);
  const [scaleY] = useAtom(scaleYAtom);
  const [scaleZ] = useAtom(scaleZAtom);

  const [buildingShape, setBuildingShape] = useState(null);
  const [floorShapes, setFloorShapes] = useState([]);

  useEffect(() => {
    if (!buildingData || !buildingData.building) return;

    const { geoJSON, floors } = buildingData.building;
    console.log(buildingData.building);

    // Process building shape
    const buildingCoords = processGeometry(geoJSON[0]);
    console.log(buildingCoords);
    const buildingShape = createShapeFromCoords(buildingCoords);
    setBuildingShape(buildingShape);

    // Process floor shapes
    const newFloorShapes = floors.map((floor) => {
      const floorCoords = processGeometry(floor.geoJSON[0]);
      return createShapeFromCoords(floorCoords);
    });
    setFloorShapes(newFloorShapes);
  }, [buildingData]);

  const processGeometry = (feature) => {
    if (feature.geometry.type === "LineString") {
      const { coordinates } = feature.geometry;
      const offset = feature.properties.offset || 0;
      return createOffsetPolygon(coordinates, offset);
    } else {
      return feature.geometry.coordinates[0];
    }
    return [];
  };

  const createOffsetPolygon = (coordinates, offset) => {
    // Convert coordinates to Clipper path
    const path = coordinates.map(([x, y]) => ({ X: x, Y: y }));

    const co = new clipperLib.ClipperOffset();
    const offsetPaths = new clipperLib.Paths();
    co.AddPath(
      path,
      clipperLib.JoinType.jtSquare,
      clipperLib.EndType.etOpenSquare
    );
    co.Execute(offsetPaths, offset);

    // If we get multiple paths, join them
    const result = offsetPaths.reduce((acc, path) => [...acc, ...path], []);
    return result.map(({ X, Y }) => [X, Y]);
  };

  const createShapeFromCoords = (coords) => {
    const shape = new Shape();
    console.log(coords);
    shape.moveTo(coords[0][0], coords[0][1]);
    coords.slice(1).forEach((coord) => shape.lineTo(coord[0], coord[1]));
    return shape;
  };

  if (!buildingShape) return null;

  return (
    <>
      <group {...props} scale={[scaleX, scaleY, scaleZ]} type="Building">
        {/* Building outline */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <extrudeGeometry
            args={[
              buildingShape,
              {
                depth:
                  buildingData.building.floorHeight *
                  buildingData.building.floors.length,
                bevelEnabled: false,
              },
            ]}
          />
          <meshStandardMaterial color={color} transparent opacity={0.5} />
        </mesh>

        {/* Floors */}
        {buildingData.building.floors.map((floor, index) => (
          <group
            key={floor.id}
            position={[0, index * (buildingData.building.floorHeight || 3), 0]}
          >
            <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <extrudeGeometry
                args={[floorShapes[index], { depth: 0.1, bevelEnabled: false }]}
              />
              <meshStandardMaterial color={color} />
            </mesh>

            {/* Spaces */}
            {floor.spaces.map((space) => {
              const spaceCoords = processGeometry(space.geoJSON[0]);
              const spaceShape = createShapeFromCoords(spaceCoords);

              return (
                <mesh
                  key={space.id}
                  position={[0, 0.1, 0]}
                  rotation={[-Math.PI / 2, 0, 0]}
                >
                  <extrudeGeometry
                    args={[
                      spaceShape,
                      {
                        depth: buildingData.building.floorHeight - 0.2 || 2.9,
                        bevelEnabled: false,
                      },
                    ]}
                  />
                  <meshStandardMaterial
                    color={space.color || "#ff0000"}
                    transparent
                    opacity={0.7}
                  />
                </mesh>
              );
            })}
          </group>
        ))}
      </group>
    </>
  );
};

export const BuildingDefinition = {
  component: Building,
  getControls: (id, updateComponent) => ({
    building: folder({
      name: {
        value: "",
        label: "Building Name",
        ...createControlHandlers(
          id,
          updateComponent,
          "buildingData.building.name"
        ),
      },
      height: {
        value: 12,
        min: 3,
        max: 100,
        step: 1,
        label: "Building Height",
        ...createControlHandlers(
          id,
          updateComponent,
          "buildingData.building.height"
        ),
      },
    }),
    appearance: folder({
      color: {
        value: "#cccccc",
        label: "Building Color",
        ...createControlHandlers(id, updateComponent, "color"),
      },
    }),
  }),
  defaultProps: {
    buildingData: null,
    color: "#cccccc",
  },
};
