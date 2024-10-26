import { useCallback, useEffect, useState } from "react";
import { roomName } from "../utils/nameGenerator";

export const useRoomRoute = () => {
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

  return room;
};
