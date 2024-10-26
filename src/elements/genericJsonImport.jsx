import { folder } from "leva";
import { createControlHandlers } from "./ComponentRegistry";
import * as THREE from "three";
import { useRef, useMemo } from "react";

export const createComponentFromJson = (jsonDefinition) => {
  const Component = (props) => {
    const { geometry, material, parts } = jsonDefinition;
    const meshRef = useRef();

    if (parts) {
      // Multi-part component (e.g., Table)
      const componentParts = useMemo(() => {
        return parts.map((part) => {
          const GeometryClass = THREE[part.geometry.type];
          const MaterialClass = THREE[part.material.type];

          const geometryArgs = part.geometry.args.map((arg) => props[arg]);
          const geometry = new GeometryClass(...geometryArgs);

          const materialProps = Object.fromEntries(
            Object.entries(part.material.props).map(([key, value]) => [
              key,
              props[value],
            ])
          );
          const material = new MaterialClass(materialProps);

          const position = part.position.map((pos) => {
            if (typeof pos === "string") {
              // eslint-disable-next-line no-eval
              return eval(pos.replace(/([a-zA-Z]+)/g, "props.$1"));
            }
            return pos;
          });

          return { geometry, material, position };
        });
      }, [props]);

      return (
        <group ref={meshRef} {...props} type={jsonDefinition.component}>
          {componentParts.map((part, index) => (
            <mesh
              key={index}
              geometry={part.geometry}
              material={part.material}
              position={part.position}
            />
          ))}
        </group>
      );
    } else {
      // Single-part component (e.g., Box, WBeam)
      const geometryInstance = useMemo(() => {
        const GeometryClass = THREE[geometry.type];
        if (typeof geometry.args[0] === "function") {
          // Special case for WBeam
          const shape = geometry.args[0](props);
          const options = Object.fromEntries(
            Object.entries(geometry.args[1]).map(([key, value]) => [
              key,
              props[value] || value,
            ])
          );
          return new GeometryClass(shape, options);
        } else {
          const geometryArgs = geometry.args.map((arg) => props[arg]);
          return new GeometryClass(...geometryArgs);
        }
      }, [props]);

      const materialProps = Object.fromEntries(
        Object.entries(material.props).map(([key, value]) => [
          key,
          props[value],
        ])
      );
      const materialInstance = useMemo(() => {
        const MaterialClass = THREE[material.type];
        return new MaterialClass(materialProps);
      }, [JSON.stringify(materialProps)]);

      return (
        <mesh
          ref={meshRef}
          {...props}
          type={jsonDefinition.component}
          geometry={geometryInstance}
          material={materialInstance}
        />
      );
    }
  };

  const ComponentDefinition = {
    component: Component,
    getControls: (id, updateComponent) => {
      const controls = {};

      Object.entries(jsonDefinition.controls).forEach(
        ([folderName, folderControls]) => {
          controls[folderName] = folder(
            Object.entries(folderControls).reduce((acc, [key, config]) => {
              acc[key] = {
                value: config.value,
                label: key.charAt(0).toUpperCase() + key.slice(1),
                ...config,
                ...createControlHandlers(id, updateComponent, key),
              };
              return acc;
            }, {})
          );
        }
      );

      return controls;
    },
    defaultProps: jsonDefinition.defaultProps,
  };

  return { Component, ComponentDefinition };
};
