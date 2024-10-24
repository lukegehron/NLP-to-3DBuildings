import { useTransformControls } from "../providers/TransformControlsProvider";
import { useSceneState } from "../hooks/useSceneState";
import { ComponentRegistry } from "../elements/ComponentRegistry";
import { useTransformState } from "../hooks/useTransformState";
import { SceneComponentData } from "../types";
import { useControls } from "leva";

const SceneNode = ({ node }: { node: any }) => {
  const registry = ComponentRegistry[node.type];

  if (!registry) {
    throw new Error(`Component type "${node.type}" not found in registry.`);
  }

  const { component: Component, getControls, defaultProps } = registry;
  const { updateComponent } = useSceneState();

  // Only create controls if they're defined and we're the selected node
  const { setSelectedId } = useTransformControls();
  const { position, rotation, scale } = useTransformState(node.id);

  // Only show controls when this node is selected
  const nodeControls = useControls(
    node.type,
    // Generate controls with the update function injected
    getControls(node.id, updateComponent),
    {
      collapsed: true,
    }
  );

  if (!registry) return null;

  return (
    <Component
      {...defaultProps}
      {...nodeControls}
      {...node.props}
      position={position}
      rotation={rotation}
      scale={scale}
      uuid={node.id}
      onClick={() => {
        setSelectedId(node.id);
      }}
    >
      {node.children?.map((child: SceneComponentData) => (
        <SceneNode key={child.id} node={child} />
      ))}
    </Component>
  );
};

export const SceneRenderer = () => {
  const { sceneGraph } = useSceneState();

  if (!sceneGraph) return null;

  return (
    <>
      {sceneGraph.map((node) => (
        <SceneNode key={node.id} node={node} />
      ))}
    </>
  );
};
