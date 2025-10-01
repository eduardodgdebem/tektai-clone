import React from "react";
import { Html } from "@react-three/drei";
import { theme } from "../theme";

const spinKeyframes = `@keyframes loader-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;

export const Loader: React.FC = () => (
  <Html center>
    <>
      <div
        style={{
          width: "4rem",
          height: "4rem",
          borderRadius: "50%",
          borderWidth: "4px",
          borderStyle: "solid",
          borderColor: "rgba(255, 255, 255, 0.15)",
          borderTopColor: theme.colors.accent,
          animation: "loader-spin 1s linear infinite",
        }}
      />
      <style>{spinKeyframes}</style>
    </>
  </Html>
);

export default Loader;
