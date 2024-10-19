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
    const { setState, setPath } = useLiveblocksState({ path: undefined });

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
        return;
      }

      setPath(path);

      const uuid = path[path.length - 1];
      const selObject = scene.getObjectByProperty("uuid", uuid);
      _setSelectedObject(selObject);
    }, []);

    const orbitControlsRef = useRef(null);

    useEffect(() => {
      if (orbitControlsRef.current) {
        const controls = orbitControlsRef.current;
        // @ts-expect-error
        controls.enabled = !isTransforming;
      }
    }, [isTransforming]);

    const onTransformEnd = useCallback(() => {
      const matrix = selectedObject?.matrix.clone().toArray();
      console.log({ matrix });
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
              console.log("mouse up");
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
