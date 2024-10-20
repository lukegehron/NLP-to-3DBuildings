import { Outlines } from "./OutlinedObject";

import { useOthersMapped } from "@liveblocks/react";

export const PresenceOutlines = () => {
  const presenceData = useOthersMapped((other) => ({
    color: other.presence?.color,
    selected: other.presence?.selected,
  }));

  return (
    <>
      {presenceData.map(([key, data]) => {
        // @ts-expect-error
        if (data.selected && data.selected.length > 0) {
          // @ts-expect-error
          const uuid = data.selected[data.selected.length - 1];
          // validate data.selected
          if (
            !Array.isArray(data.selected) ||
            data.selected.length === 0 ||
            !data.selected.every((s) => typeof s === "string")
          ) {
            return null;
          }
          return (
            <Outlines
              key={key}
              path={data.selected as string[]}
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
