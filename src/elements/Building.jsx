import { folder } from "leva";
import {
  // BaseComponentDefinition,
  createControlHandlers,
  // UpdateFunction,
} from "./ComponentRegistry";
import { Shape } from "three";
import { useState, useEffect } from "react";

// const createLShape = (width: number, length: number, thickness: number) => {
//   const shape = new Shape();
//   shape.moveTo(0, 0);
//   shape.lineTo(width, 0);
//   shape.lineTo(width, thickness);
//   shape.lineTo(thickness, thickness);
//   shape.lineTo(thickness, length);
//   shape.lineTo(0, length);
//   shape.lineTo(0, 0);
//   return shape;
// };

export const Building = ({ buildingData, color = "#cccccc", ...props }) => {
  const [data, setData] = useState(buildingData);

  useEffect(() => {
    setData(buildingData);
  }, [buildingData]);

  if (!data || !data.building) return null;

  const { name, geoJSON, floors } = data.building;

  // Create building shape from GeoJSON
  const buildingShape = new Shape();
  const coordinates = geoJSON[0].geometry.coordinates[0];
  buildingShape.moveTo(coordinates[0][0], coordinates[0][1]);
  coordinates
    .slice(1)
    .forEach((coord) => buildingShape.lineTo(coord[0], coord[1]));

  const floorShapes = floors.map((floor) => {
    const floorShape = new Shape();
    const floorCoords = floor.geoJSON[0].geometry.coordinates[0];
    floorShape.moveTo(floorCoords[0][0], floorCoords[0][1]);
    floorCoords
      .slice(1)
      .forEach((coord) => floorShape.lineTo(coord[0], coord[1]));
    return floorShape;
  });

  const currentFloor = floorShapes[0];
  return (
    <group {...props} type="Building">
      {/* Building outline */}
      <mesh position={[0, 0, 0]}>
        <extrudeGeometry
          args={[
            buildingShape,
            { depth: data.building.height || 12, bevelEnabled: false },
          ]}
        />
        <meshStandardMaterial color={color} transparent opacity={0.5} />
      </mesh>

      {/* Floors */}
      {floors.map((floor, index) => (
        <group key={floor.id} position={[0, index * (floor.height || 3), 0]}>
          <mesh>
            <extrudeGeometry
              args={[currentFloor, { depth: 0.1, bevelEnabled: false }]}
            />
            <meshStandardMaterial color={color} />
          </mesh>

          {/* Spaces */}
          {floor.spaces.map((space) => {
            const spaceShape = new Shape();
            const spaceCoords = space.geoJSON[0].geometry.coordinates[0];
            spaceShape.moveTo(spaceCoords[0][0], spaceCoords[0][1]);
            spaceCoords
              .slice(1)
              .forEach((coord) => spaceShape.lineTo(coord[0], coord[1]));

            return (
              <mesh key={space.id} position={[0, 0.1, 0]}>
                <extrudeGeometry
                  args={[
                    spaceShape,
                    { depth: floor.height || 3, bevelEnabled: false },
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
