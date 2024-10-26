import { atom } from "jotai";

export const selectedIdAtom = atom(null);
export const selectedAtom = atom(null);
export const allComponentsAtom = atom([]);
export const buildingDataAtom = atom({
  building: {
    id: "building_001",
    name: "Main Office Building",
    type: "polygon",
    floorHeight: 3,
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
        type: "linestring",
        geoJSON: [
          {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [
                [0, 0],
                [100, 0],
                [100, 100],
                // [0, 100],
              ],
            },
            properties: {
              name: "Ground Floor Outline",
              offset: 5, // Offset value in meters
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
});

// Function to process geometry based on type
const processGeometry = (feature) => {
  if (feature.geometry.type === "Polygon") {
    return feature.geometry.coordinates[0];
  } else if (feature.geometry.type === "LineString") {
    const { coordinates } = feature.geometry;
    const offset = feature.properties.offset || 0;
    // Now this will work correctly with just start and end points
    return createOffsetPolygon(coordinates, offset);
  }
  return [];
};

// Placeholder function for creating offset polygon
// Replace this with actual clipper logic implementation
const createOffsetPolygon = (coordinates, offset) => {
  // Implement clipper logic here
  // For now, we'll just return the original coordinates
  return [...coordinates, coordinates[0]];
};

// Updated building component (pseudo-code)
export const BuildingComponent = () => {
  const [buildingData] = useAtom(buildingDataAtom);
  const { building } = buildingData;

  const processedCoordinates = building.geoJSON.map((feature) =>
    processGeometry(feature)
  );

  // Render the building using processedCoordinates
  // ...
};
