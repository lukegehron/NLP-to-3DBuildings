// Define Liveblocks types for your application
// https://liveblocks.io/docs/api-reference/liveblocks-react#Typing-your-data
import { LiveMap } from "@liveblocks/client";
// import { Matrix4, SceneComponent } from "./src/types";

declare global {
  interface Liveblocks {
    // Each user's Presence, for useMyPresence, useOthers, etc.
    Presence: {
      name: string;
      color: string;
      selected: string | null;
      selectedTransform: any | null;
    };
    // The Storage tree for the room, for useMutation, useStorage, etc.
    Storage: {
      components: LiveMap<any, any>; // Replace 'any' with your component type
    };
  }
}

export {};
