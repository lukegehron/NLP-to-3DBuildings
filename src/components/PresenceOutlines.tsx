import { useEffect } from "react";
import { Outlines } from "./OutlinedObject";

import { useEditComment, useOthersMapped } from "@liveblocks/react";

export const PresenceOutlines = () => {
  const presenceData = useOthersMapped((other) => ({
    color: other.presence?.color,
    selected: other.presence?.selected,
  }));

  return (
    <>
      {presenceData.map(([key, data]) => {
        if (data.selected) {
          const uuid = data.selected as string | null;
          if (!uuid) return null;
          return (
            <Outlines
              key={key}
              uuid={uuid}
              color={data.color as string}
              thickness={10}
            />
          );
        }
        return null;
      })}
    </>
  );
};
