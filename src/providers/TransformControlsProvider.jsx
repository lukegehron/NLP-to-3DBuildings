import { OrbitControls, TransformControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import React, {
  useEffect,
  useRef,
  useState,
  useContext,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Camera, Object3D } from "three";
import { useUpdateMyPresence } from "@liveblocks/react";
import { useSceneState } from "../hooks/useSceneState";
import { TransformControls as TransformControlsImpl } from "three-stdlib";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { selectedIdAtom, selectedAtom } from "../utils/atom";
import { useAtom } from "jotai";
// import { EulerTuple } from "../types";

const TransformControlsContext = React.createContext({});

export const TransformControlsProvider = forwardRef(({ children }, ref) => {
  const { gl, scene } = useThree();

  const [isTransforming, setIsTransforming] = useState(false);
  const [selectedId, setSelectedId] = useAtom(selectedIdAtom);
  const [selectedObject, setSelectedObject] = useAtom(selectedAtom);

  const { updateComponent } = useSceneState();
  const updateMyPresence = useUpdateMyPresence();

  const transformControlsRef = useRef(null);
  const orbitControlsRef = useRef(null);
  const intervalRef = useRef(undefined);

  const [mode, setMode] = useState("translate");

  useImperativeHandle(ref, () => ({
    deselect: () => setSelectedId(null),
    setMode: (newMode) => {
      setMode(newMode);
    },
  }));

  // Attach / detach transform controls based on selected object
  useEffect(() => {
    if (!transformControlsRef.current) {
      return;
    }

    if (selectedObject) {
      transformControlsRef.current.attach(selectedObject);
    } else {
      transformControlsRef.current.detach();
    }
  }, [selectedObject]);

  // Update selected object when selectedId changes
  useEffect(() => {
    if (selectedId) {
      const object = scene.getObjectByProperty("uuid", selectedId);
      if (object) {
        setSelectedObject(object);
        const matrix = object.matrix.toArray();
        updateMyPresence({ selected: selectedId, selectedTransform: matrix });
      }
    } else {
      setSelectedObject(null);
      updateMyPresence({ selected: null, selectedTransform: null });
    }
  }, [selectedId]);

  // Disable orbit controls when transforming
  useEffect(() => {
    if (orbitControlsRef.current) {
      const controls = orbitControlsRef.current;
      controls.enabled = !isTransforming;
    }
  }, [isTransforming]);

  // Update presence state during transformation
  useEffect(() => {
    if (isTransforming && selectedObject) {
      const update = () => {
        if (!selectedObject) return;
        const matrix = selectedObject.matrix.toArray();
        updateMyPresence({ selectedTransform: matrix });
      };

      // 120 fps, good performace control
      intervalRef.current = setInterval(update, 1000 / 120);
    } else if (typeof intervalRef.current === "number") {
      updateMyPresence({ selected: null, selectedTransform: null });
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }

    return () => {
      if (typeof intervalRef.current === "number") {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };
  }, [isTransforming, selectedObject]);

  // Update component state when transformation ends
  const onTransformEnd = useCallback(() => {
    if (!selectedId) return;
    const object = scene.getObjectByProperty("uuid", selectedId);
    if (!object) return;
    const position = object.position.toArray();
    const rotation = createEuler(...object.rotation.toArray());
    const scale = object.scale.toArray();

    updateComponent({ id: selectedId, props: { position, rotation, scale } });
  }, [selectedId]);

  return (
    <TransformControlsContext.Provider
      value={{
        selectedId,
        setSelectedId,
        setMode,
      }}
    >
      {children}
      {selectedObject && (
        <TransformControls
          ref={transformControlsRef}
          object={selectedObject}
          onMouseDown={() => setIsTransforming(true)}
          onMouseUp={() => {
            onTransformEnd();
            setIsTransforming(false);
          }}
          castShadow={false}
          mode={mode}
        />
      )}
      <OrbitControls
        ref={orbitControlsRef}
        // @ts-expect-error
        args={[undefined, gl.domElement]}
        maxZoom={100}
        minZoom={1}
        // Disable orbit controls during transformation
        enabled={!isTransforming}
        // Add additional props to make controls less eager to take over
        enableDamping={true}
        dampingFactor={0.05}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.5}
      />
    </TransformControlsContext.Provider>
  );
});

export const useTransformControls = () => {
  return useContext(TransformControlsContext);
};

// Helper function to create Euler rotation with a required order
export function createEuler(x, y, z, order = "XYZ") {
  return [x, y, z, order];
}
