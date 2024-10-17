import React, { useRef, useState, useEffect } from "react";
import { Canvas, MeshProps, useThree } from "@react-three/fiber";
import {
  TransformControls,
  OrbitControls,
  OrthographicCamera,
  PerspectiveCamera,
} from "@react-three/drei";
import { Object3D, Object3DEventMap } from "three";

function Box({
  color,
  ...props
}: {
  color: string;
} & MeshProps) {
  return (
    <mesh {...props}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function Scene() {
  const [selectedObject, setSelectedObject] =
    useState<Object3D<Object3DEventMap>>();
  const [isTransforming, setIsTransforming] = useState(false);
  const orbitControlsRef = useRef(null);
  const { camera, gl } = useThree();
  const ref = useRef(null);

  useEffect(() => {
    if (orbitControlsRef.current) {
      const controls = orbitControlsRef.current;
      // @ts-expect-error
      controls.enabled = !isTransforming;
    }
  }, [isTransforming]);

  const [isOrtho, setIsOrtho] = useState(false);

  return (
    <>
      {isOrtho ? (
        <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={50} />
      ) : (
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={75} />
      )}
      <ambientLight intensity={0.75} color={0xffffff} />
      <pointLight
        position={[10, 10, 10]}
        onClick={(e) => setSelectedObject(e.eventObject)}
      />
      <Box
        ref={ref}
        position={[-1.2, 0, 0]}
        color="red"
        onClick={(e) => setSelectedObject(e.eventObject)}
      />
      <Box
        position={[1.2, 0, 0]}
        color="blue"
        onClick={(e) => setSelectedObject(e.eventObject)}
      />
      {selectedObject && (
        <TransformControls
          object={selectedObject}
          onMouseDown={() => setIsTransforming(true)}
          onMouseUp={() => setIsTransforming(false)}
        />
      )}

      {/* @ts-expect-error */}
      <OrbitControls ref={orbitControlsRef} args={[undefined, gl.domElement]} />
    </>
  );
}

function App() {
  return (
    <Canvas
      style={{
        width: "100vw",
        height: "100vh",
        display: "block",
        position: "absolute",
        top: 0,
        left: 0,
      }}
    >
      <Scene />
    </Canvas>
  );
}

export default App;
