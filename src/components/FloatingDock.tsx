import React from "react";
import { theme } from "../theme";
import { TransformMode } from "./ARScene";
import {
  MoveIcon,
  RotateIcon,
  ScaleIcon,
  ResetIcon,
  RecenterIcon,
} from "./Icons";

interface FloatingDockProps {
  transformMode: TransformMode;
  onModeChange: (mode: TransformMode) => void;
  onReset: () => void;
  onRecenter: () => void;
  recenterDisabled?: boolean;
}

const dockStyle: React.CSSProperties = {
  position: "absolute",
  left: "50%",
  bottom: "calc(6.5rem + env(safe-area-inset-bottom, 0))",
  transform: "translateX(-50%)",
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  padding: "0.75rem 1rem",
  borderRadius: "1rem",
  background: theme.colors.dark + "e6",
  backdropFilter: "blur(12px)",
  boxShadow: "0 16px 36px rgba(0, 0, 0, 0.35)",
  color: theme.colors.white,
  fontFamily: theme.fonts.primary,
  zIndex: 30,
  flexWrap: "wrap",
  justifyContent: "center",
  maxWidth: "calc(100% - 2rem)",
};

const buttonBase: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "3rem",
  height: "3rem",
  borderRadius: "0.75rem",
  border: "none",
  cursor: "pointer",
  background: "transparent",
  color: theme.colors.white,
  transition: "transform 0.15s ease, background 0.2s ease, color 0.2s ease",
};

const actionButtonStyle = (disabled?: boolean): React.CSSProperties => ({
  ...buttonBase,
  background: theme.colors.accent,
  color: theme.colors.dark,
  width: "3.25rem",
  opacity: disabled ? 0.45 : 1,
  cursor: disabled ? "not-allowed" : "pointer",
});

export const FloatingDock: React.FC<FloatingDockProps> = ({
  transformMode,
  onModeChange,
  onReset,
  onRecenter,
  recenterDisabled,
}) => {
  const controlButtons: Array<{
    mode: TransformMode;
    icon: React.ReactNode;
    label: string;
  }> = [
    { mode: "translate", icon: <MoveIcon />, label: "Translate" },
    { mode: "rotate", icon: <RotateIcon />, label: "Rotate" },
    { mode: "scale", icon: <ScaleIcon />, label: "Scale" },
  ];

  return (
    <nav style={dockStyle} aria-label="Transformation controls">
      {controlButtons.map(({ mode, icon, label }) => {
        const isActive = mode === transformMode;
        return (
          <button
            key={mode}
            onClick={() => onModeChange(mode)}
            title={label}
            style={{
              ...buttonBase,
              background: isActive
                ? theme.colors.accent
                : "rgba(255, 255, 255, 0.08)",
              color: isActive ? theme.colors.dark : theme.colors.white,
            }}
          >
            {icon}
          </button>
        );
      })}
      <span
        style={{
          width: "1px",
          height: "2rem",
          background: "rgba(255, 255, 255, 0.18)",
        }}
        aria-hidden
      />
      <button
        type="button"
        onClick={onRecenter}
        title="Re-center model"
        aria-label="Re-center model"
        style={actionButtonStyle(recenterDisabled)}
        disabled={recenterDisabled}
      >
        <RecenterIcon />
      </button>
      <button
        type="button"
        onClick={onReset}
        title="Reset Scene"
        aria-label="Reset Scene"
        style={actionButtonStyle(false)}
      >
        <ResetIcon />
      </button>
    </nav>
  );
};

export default FloatingDock;
