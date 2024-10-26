import { atom } from "jotai";

export const selectedIdAtom = atom(null);
export const selectedAtom = atom(null);
export const allComponentsAtom = atom([]);
export const scaleXAtom = atom(0.3);
export const scaleYAtom = atom(0.3);
export const scaleZAtom = atom(0.3);
export const buildingDataAtom = atom({
  //   building: {
  //     id: "building_001",
  //     name: "Main Office Building",
  //     type: "polygon",
  //     floorHeight: 3,
  //     geoJSON: [
  //       {
  //         type: "Feature",
  //         geometry: {
  //           type: "Polygon",
  //           coordinates: [
  //             [
  //               [0, 0],
  //               [100, 0],
  //               [100, 100],
  //               [0, 100],
  //               [0, 0],
  //             ],
  //           ],
  //         },
  //         properties: {
  //           name: "Main Office Building Footprint",
  //         },
  //       },
  //     ],
  //     floors: [
  //       {
  //         id: "floor_1",
  //         name: "Ground Floor",
  //         type: "linestring",
  //         geoJSON: [
  //           {
  //             type: "Feature",
  //             geometry: {
  //               type: "LineString",
  //               coordinates: [
  //                 [0, 0],
  //                 [100, 0],
  //                 [100, 100],
  //                 // [0, 100],
  //               ],
  //             },
  //             properties: {
  //               name: "Ground Floor Outline",
  //               offset: 50, // Offset value in meters
  //             },
  //           },
  //         ],
  //         spaces: [
  //           {
  //             id: "space_101",
  //             name: "Reception",
  //             geoJSON: [
  //               {
  //                 type: "Feature",
  //                 geometry: {
  //                   type: "Polygon",
  //                   coordinates: [
  //                     [
  //                       [0, 0],
  //                       [20, 0],
  //                       [20, 30],
  //                       [0, 30],
  //                       [0, 0],
  //                     ],
  //                   ],
  //                 },
  //                 properties: {
  //                   name: "Reception Area",
  //                 },
  //               },
  //             ],
  //           },
  //         ],
  //       },
  //     ],
  //   },

  building: {
    id: "building_001",
    name: "Core and Shell Building",
    // type: "core_and_shell",
    type: "polygon",
    baseDimensions: {
      length: 70,
      width: 30,
    },
    // floorHeights: [20, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12],
    floorHeight: 20,
    numLevels: 12,
    coreDimensions: {
      length: 30,
      width: 10,
    },
    geoJSON: [
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [0, 0],
              [70, 0],
              [70, 30],
              [0, 30],
              [0, 0],
            ],
          ],
        },
        properties: {
          name: "Building Footprint",
        },
      },
    ],
    floors: [
      {
        id: "floor_1",
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
        ],
        name: "Ground Floor",
        type: "polygon",
        height: 20,
        geoJSON: [
          {
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [0, 0],
                  [70, 0],
                  [70, 30],
                  [0, 30],
                  [0, 0],
                ],
              ],
            },
            properties: {
              name: "Ground Floor Outline",
            },
          },
        ],
      },
      {
        id: "floor_2",
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
        ],
        name: "Second Floor",
        type: "polygon",
        height: 12,
        geoJSON: [
          {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [0, 0],
                  [70, 0],
                  [70, 30],
                  [0, 30],
                  [0, 0],
                ],
              ],
            },
            properties: {
              name: "Second Floor Outline",
            },
          },
        ],
      },
      // Repeat for remaining floors...
    ],
    // core: {
    //   id: "core_001",
    //   name: "Building Core",
    //   dimensions: {
    //     length: 30,
    //     width: 10,
    //   },
    //   geoJSON: [
    //     {
    //       type: "Feature",
    //       geometry: {
    //         type: "Polygon",
    //         coordinates: [
    //           [
    //             [20, 10],
    //             [50, 10],
    //             [50, 20],
    //             [20, 20],
    //             [20, 10],
    //           ],
    //         ],
    //       },
    //       properties: {
    //         name: "Core Footprint",
    //       },
    //     },
    //   ],
    // },
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
