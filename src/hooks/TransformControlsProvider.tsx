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
import { Object3D } from "three";
import { useLiveblocksState } from "./useLivblocksState";

interface TransformControlsContextValue {
  setSelectedObject: (path: string[] | undefined) => void;
}

const TransformControlsContext =
  React.createContext<TransformControlsContextValue>(
    {} as TransformControlsContextValue
  );

interface TransformControlProviderProps {
  children?: React.ReactNode;
}

export const TransformControlsProvider = forwardRef(
  ({ children }: TransformControlProviderProps, ref): React.ReactElement => {
    const { gl, scene } = useThree();
    const { setState, setPath, updateMyPresence } = useLiveblocksState({
      path: undefined,
    });

    const [isTransforming, setIsTransforming] = useState(false);
    const [selectedObject, _setSelectedObject] = useState<Object3D | undefined>(
      undefined
    );

    useImperativeHandle(ref, () => ({
      deselect: () => setSelectedObject(undefined),
    }));

    const setSelectedObject = useCallback((path?: string[]) => {
      if (!path) {
        _setSelectedObject(undefined);
        updateMyPresence({ selected: [] });
        return;
      }

      setPath(path);

      const uuid = path[path.length - 1];
      const selectedObject = scene.getObjectByProperty("uuid", uuid);

      if (!selectedObject) {
        return;
      }

      _setSelectedObject(selectedObject);

      const matrix = selectedObject.matrix.toArray();
      updateMyPresence({ selected: path, selectedTransform: matrix });
    }, []);

    const orbitControlsRef = useRef(null);

    useEffect(() => {
      if (orbitControlsRef.current) {
        const controls = orbitControlsRef.current;
        // @ts-expect-error
        controls.enabled = !isTransforming;
      }
    }, [isTransforming]);

    const intervalRef = useRef<number | undefined>(undefined);

    useEffect(() => {
      if (isTransforming && selectedObject) {
        const update = () => {
          const matrix = selectedObject.matrix.toArray();
          updateMyPresence({ selectedTransform: matrix });
        };

        // 120 fps, good performace control
        intervalRef.current = setInterval(update, 1000 / 120);
      } else if (typeof intervalRef.current === "number") {
        updateMyPresence({ selectedTransform: null });
        clearInterval(intervalRef.current);
      }

      return () => {
        if (typeof intervalRef.current === "number") {
          clearInterval(intervalRef.current);
        }
      };
    }, [isTransforming, selectedObject]);

    const onTransformEnd = useCallback(() => {
      const matrix = selectedObject?.matrix.toArray();
      setState({ matrix });
    }, [selectedObject]);

    return (
      <TransformControlsContext.Provider
        value={{
          setSelectedObject,
        }}
      >
        {children}
        {selectedObject && (
          <TransformControls
            object={selectedObject}
            onMouseDown={() => setIsTransforming(true)}
            onMouseUp={() => {
              onTransformEnd();
              setIsTransforming(false);
            }}
          />
        )}
        <OrbitControls
          ref={orbitControlsRef}
          // @ts-expect-error
          args={[undefined, gl.domElement]}
        />
      </TransformControlsContext.Provider>
    );
  }
);

export const useTransformControlsProvider =
  (): TransformControlsContextValue => {
    return useContext(TransformControlsContext);
  };
