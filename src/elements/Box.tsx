export const Box = ({
  width = 1,
  height = 1,
  length = 10,
  color = "orange",
  ...props
}) => {
  return (
    <mesh {...props} type="Box">
      <boxGeometry args={[width, height, length]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};
