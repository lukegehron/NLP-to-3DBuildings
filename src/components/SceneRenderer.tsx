import { useTransformControls } from "../providers/TransformControlsProvider";
import { useSceneState } from "../hooks/useSceneState";
import { ComponentRegistry } from "../elements/ComponentRegistry";
import { useTransformState } from "../hooks/useTransformState";
import { SceneComponentData } from "../types";

const SceneNode = ({ node }: { node: any }) => {
  // @ts-expect-error
  const Component = ComponentRegistry[node.type];

  const { setSelectedId } = useTransformControls();

  const { position, rotation, scale } = useTransformState(node.id);

  if (!Component) return null;

  return (
    <Component
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
