// modified from
// https://github.com/pmndrs/drei/blob/21f7f4d7725d2d6f5bc8f2f3b2a476ac8998d4b3/src/core/Outlines.tsx#L60
import React from "react";
import {
  extend,
  ReactThreeFiber,
  useThree,
  applyProps,
} from "@react-three/fiber";
import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { REVISION } from "three";
import { toCreasedNormals } from "three-stdlib";
import { useTransformState } from "../hooks/useTransformState";

const OutlinesMaterial = /* @__PURE__ */ shaderMaterial(
  {
    screenspace: false,
    color: /* @__PURE__ */ new THREE.Color("black"),
    opacity: 1,
    thickness: 0.05,
    size: /* @__PURE__ */ new THREE.Vector2(),
  },
  `#include <common>
   #include <morphtarget_pars_vertex>
   #include <skinning_pars_vertex>
   uniform float thickness;
   uniform bool screenspace;
   uniform vec2 size;
   void main() {
     #if defined (USE_SKINNING)
	     #include <beginnormal_vertex>
       #include <morphnormal_vertex>
       #include <skinbase_vertex>
       #include <skinnormal_vertex>
       #include <defaultnormal_vertex>
     #endif
     #include <begin_vertex>
	   #include <morphtarget_vertex>
	   #include <skinning_vertex>
     #include <project_vertex>
     vec4 tNormal = vec4(normal, 0.0);
     vec4 tPosition = vec4(transformed, 1.0);
     #ifdef USE_INSTANCING
       tNormal = instanceMatrix * tNormal;
       tPosition = instanceMatrix * tPosition;
     #endif
     if (screenspace) {
       vec3 newPosition = tPosition.xyz + tNormal.xyz * thickness;
       gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0); 
     } else {
       vec4 clipPosition = projectionMatrix * modelViewMatrix * tPosition;
       vec4 clipNormal = projectionMatrix * modelViewMatrix * tNormal;
       vec2 offset = normalize(clipNormal.xy) * thickness / size * clipPosition.w * 2.0;
       clipPosition.xy += offset;
       gl_Position = clipPosition;
     }
   }`,
  `uniform vec3 color;
   uniform float opacity;
   void main(){
     gl_FragColor = vec4(color, opacity);
     #include <tonemapping_fragment>
     #include <${
       parseInt(REVISION.replace(/\D+/g, "")) >= 154
         ? "colorspace_fragment"
         : "encodings_fragment"
     }>
   }`
);

extend({ OutlinesMaterial });

type OutlinesProps = JSX.IntrinsicElements["group"] & {
  uuid: string;
  /** Outline color, default: black */
  color?: ReactThreeFiber.Color;
  /** Line thickness is independent of zoom, default: false */
  screenspace?: boolean;
  /** Outline opacity, default: 1 */
  opacity?: number;
  /** Outline transparency, default: false */
  transparent?: boolean;
  /** Outline thickness, default 0.05 */
  thickness?: number;
  /** Geometry crease angle (0 === no crease), default: Math.PI */
  angle?: number;
  toneMapped?: boolean;
  polygonOffset?: boolean;
  polygonOffsetFactor?: number;
  renderOrder?: number;
};

export function Outlines({
  uuid,
  color = "black",
  opacity = 1,
  transparent = false,
  screenspace = false,
  toneMapped = true,
  polygonOffset = false,
  polygonOffsetFactor = 0,
  renderOrder = 0,
  thickness = 5,
  angle = Math.PI,
  ...props
}: OutlinesProps) {
  const ref = React.useRef<THREE.Group>();
  const [material] = React.useState(
    () => new OutlinesMaterial({ side: THREE.BackSide })
  );
  const { gl, scene } = useThree();
  const contextSize = gl.getDrawingBufferSize(new THREE.Vector2());
  React.useMemo(() => extend({ OutlinesMaterial }), []);

  const oldAngle = React.useRef(0);
  const oldGeometry = React.useRef<THREE.BufferGeometry>();

  const { position, rotation, scale } = useTransformState(uuid);

  React.useLayoutEffect(() => {
    const group = ref.current;
    if (!group) return;

    const outlinedObject = scene.getObjectByProperty(
      "uuid",
      uuid
    ) as THREE.Mesh & THREE.SkinnedMesh & THREE.InstancedMesh;

    if (outlinedObject && outlinedObject.geometry) {
      if (
        oldAngle.current !== angle ||
        oldGeometry.current !== outlinedObject.geometry
      ) {
        oldAngle.current = angle;
        oldGeometry.current = outlinedObject.geometry;

        // Remove old mesh
        let mesh = group.children?.[0] as any;
        if (mesh) {
          if (angle) mesh.geometry.dispose();
          group.remove(mesh);
        }

        if (outlinedObject.skeleton) {
          mesh = new THREE.SkinnedMesh();
          mesh.material = material;
          mesh.bind(outlinedObject.skeleton, outlinedObject.bindMatrix);
          group.add(mesh);
        } else if (outlinedObject.isInstancedMesh) {
          mesh = new THREE.InstancedMesh(
            outlinedObject.geometry,
            material,
            outlinedObject.count
          );
          mesh.instanceMatrix = outlinedObject.instanceMatrix;
          group.add(mesh);
        } else {
          mesh = new THREE.Mesh();
          mesh.material = material;
          group.add(mesh);
        }
        mesh.geometry = angle
          ? toCreasedNormals(outlinedObject.geometry, angle)
          : outlinedObject.geometry;
      }
    }
  });

  React.useLayoutEffect(() => {
    const group = ref.current;
    if (!group) return;

    const mesh = group.children[0] as THREE.Mesh<
      THREE.BufferGeometry,
      THREE.Material
    >;
    if (mesh) {
      mesh.renderOrder = renderOrder;
      applyProps(mesh.material as any, {
        transparent,
        thickness,
        color,
        opacity,
        size: contextSize,
        screenspace,
        toneMapped,
        polygonOffset,
        polygonOffsetFactor,
      });
    }
  });

  React.useEffect(() => {
    return () => {
      // Dispose everything on unmount
      const group = ref.current;
      if (!group) return;

      const mesh = group.children[0] as THREE.Mesh<
        THREE.BufferGeometry,
        THREE.Material
      >;
      if (mesh) {
        if (angle) mesh.geometry.dispose();
        group.remove(mesh);
      }
    };
  }, []);

  return (
    <group
      ref={ref as React.Ref<THREE.Group>}
      {...props}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  );
}
