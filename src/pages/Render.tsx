import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { XR, createXRStore, useXR } from "@react-three/xr";
import { theme } from "../theme";
import {
  defaultTransformState,
  TransformState,
  Vector3Tuple,
} from "../types/transform";
import { Loader } from "../components/Loader";
import ARScene, { TransformMode } from "../components/ARScene";
import ChatPanel from "../components/ChatPanel";
import DesktopScene from "../components/DesktopScene";
import FloatingDock from "../components/FloatingDock";
import { InfoIcon } from "../components/Icons";
import InfoPanel from "../components/InfoPanel";
import { TransformAction } from "../types/actions";
import type { ModelConfig } from "../types/modelaConfig";
import { useModelTable } from "../hooks/useModelTable";
import { useParams } from "react-router-dom";

const store = createXRStore({
  hitTest: true,
  planeDetection: true,
  domOverlay: true,
});

type XREditorProps = {
  transformMode: TransformMode;
  transformState: TransformState;
  onTransformChange: (state: TransformState) => void;
  onPlacement: (state: TransformState) => void;
  resetSignal: number;
  modelConfig?: ModelConfig;
};

const XREditor: React.FC<XREditorProps> = ({
  transformMode,
  transformState,
  onTransformChange,
  onPlacement,
  resetSignal,
  modelConfig,
}) => {
  const { isPresenting } = useXR();

  if (!isPresenting) {
    return (
      <DesktopScene
        transformMode={transformMode}
        transformState={transformState}
        onTransformChange={onTransformChange}
        modelConfig={modelConfig}
      />
    );
  }

  return (
    <ARScene
      transformMode={transformMode}
      transformState={transformState}
      onTransformChange={onTransformChange}
      onPlacement={onPlacement}
      resetSignal={resetSignal}
      modelConfig={modelConfig}
    />
  );
};

const appShellStyle: React.CSSProperties = {
  width: "100vw",
  height: "calc(100vh - 56px)",
  overflow: "hidden",
  background: theme.colors.gray[900],
  color: theme.colors.white,
  fontFamily: theme.fonts.primary,
};

const infoButtonStyle: React.CSSProperties = {
  position: "absolute",
  top: "1.5rem",
  right: "1.5rem",
  width: "3.25rem",
  height: "3.25rem",
  borderRadius: "999px",
  border: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(255, 255, 255, 0.08)",
  color: theme.colors.white,
  cursor: "pointer",
  backdropFilter: "blur(12px)",
  boxShadow: "0 12px 28px rgba(0, 0, 0, 0.35)",
  zIndex: 25,
};

const infoButtonActiveStyle: React.CSSProperties = {
  ...infoButtonStyle,
  background: theme.colors.accent,
  color: theme.colors.dark,
};

const enterARButtonStyle: React.CSSProperties = {
  position: "absolute",
  top: "1.5rem",
  left: "50%",
  transform: "translateX(-50%)",
  padding: "0.9rem 1.8rem",
  borderRadius: "999px",
  border: "none",
  backgroundColor: theme.colors.accent,
  color: theme.colors.dark,
  fontWeight: 600,
  letterSpacing: "0.02em",
  cursor: "pointer",
  boxShadow: "0 18px 45px rgba(0,0,0,0.35)",
  zIndex: 20,
  fontFamily: theme.fonts.primary,
};

const loaderScreenStyle: React.CSSProperties = {
  width: "100vw",
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  gap: "1.25rem",
  background: theme.colors.gray[900],
  color: theme.colors.white,
  fontFamily: theme.fonts.primary,
};

const loaderAccentDot: React.CSSProperties = {
  width: "12px",
  height: "12px",
  borderRadius: "999px",
  background: theme.colors.accent,
  animation: "pulse 1.2s ease-in-out infinite",
};

const pulseKeyframes = `@keyframes pulse { 0%, 100% { transform: scale(0.8); opacity: 0.4; } 50% { transform: scale(1.1); opacity: 1; } }`;

const axisToIndex: Record<"x" | "y" | "z", 0 | 1 | 2> = { x: 0, y: 1, z: 2 };

const cloneTransformState = (state: TransformState): TransformState => ({
  position: [...state.position] as Vector3Tuple,
  rotation: [...state.rotation] as Vector3Tuple,
  scale: [...state.scale] as Vector3Tuple,
});

const applyActionsToState = (
  state: TransformState,
  actions: TransformAction[]
): TransformState => {
  const next: TransformState = cloneTransformState(state);

  actions.forEach((action) => {
    if (action.type === "scale") {
      let factor = Number.isFinite(action.factor) ? action.factor : 1;
      factor = Math.max(0.1, Math.min(factor, 10));
      next.scale = next.scale.map((value) => value * factor) as Vector3Tuple;
      return;
    }

    if (action.type === "rotate") {
      const index = axisToIndex[action.axis];
      const radians = (action.degrees * Math.PI) / 180;
      next.rotation[index] += radians;
      return;
    }

    if (action.type === "move") {
      const i = axisToIndex[action.axis];
      next.position[i] += action.distance;
    }
  });

  next.scale = next.scale
    .map((value) => Math.max(0.1, Math.min(value, 5)))
    .map((value) => Number(value.toFixed(5))) as Vector3Tuple;
  next.rotation = next.rotation.map((value) =>
    Number(value.toFixed(5))
  ) as Vector3Tuple;
  next.position = next.position.map((value) =>
    Number(value.toFixed(5))
  ) as Vector3Tuple;

  return next;
};

export const Render: React.FC = () => {
  const { modelId } = useParams();
  const { getById } = useModelTable();

  const [isARSupported, setARSupported] = useState<boolean | null>(null);
  const [transformMode, setTransformMode] =
    useState<TransformMode>("translate");
  const [transformState, setTransformState] = useState<TransformState>(() =>
    cloneTransformState(defaultTransformState)
  );
  const [initialTransform, setInitialTransform] = useState<TransformState>(() =>
    cloneTransformState(defaultTransformState)
  );
  const [hasPlacedObject, setHasPlacedObject] = useState(false);
  const [isInfoOpen, setInfoOpen] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);

  useEffect(() => {
    const originalFont = document.body.style.fontFamily;
    const originalBg = document.body.style.backgroundColor;
    const originalOverflow = document.body.style.overflow;
    const originalBodyHeight = document.body.style.height;
    const originalHtmlHeight = document.documentElement.style.height;
    const rootElement = document.getElementById("root");
    const originalRootHeight = rootElement?.style.height ?? "";

    document.documentElement.style.height = "100%";
    document.body.style.margin = "0";
    document.body.style.fontFamily = theme.fonts.primary;
    document.body.style.backgroundColor = theme.colors.gray[900];
    document.body.style.overflow = "hidden";
    document.body.style.height = "100%";
    if (rootElement) {
      rootElement.style.height = "100%";
    }

    const checkARSupport = async () => {
      if ((navigator as any).xr?.isSessionSupported) {
        try {
          const supported = await (navigator as any).xr.isSessionSupported(
            "immersive-ar"
          );
          setARSupported(supported);
        } catch (error) {
          setARSupported(false);
        }
      } else {
        setARSupported(false);
      }
    };

    checkARSupport();

    return () => {
      document.body.style.fontFamily = originalFont;
      document.body.style.backgroundColor = originalBg;
      document.body.style.overflow = originalOverflow;
      document.body.style.height = originalBodyHeight;
      document.documentElement.style.height = originalHtmlHeight;
      if (rootElement) {
        rootElement.style.height = originalRootHeight;
      }
    };
  }, []);

  useEffect(() => {
    // Check if the 'reloaded' flag exists in sessionStorage
    if (!sessionStorage.getItem("reloaded")) {
      // If not, set the flag and reload the page
      sessionStorage.setItem("reloaded", "true");
      window.location.reload();
    } else {
      // If the flag exists, remove it for subsequent visits
      sessionStorage.removeItem("reloaded");
    }
  }, []);

  const handlePlacement = (state: TransformState) => {
    setTransformState(cloneTransformState(state));
    setInitialTransform(cloneTransformState(state));
    setHasPlacedObject(true);
  };

  const handleTransformChange = (next: TransformState) => {
    setTransformState(cloneTransformState(next));
  };

  const handleReset = () => {
    setTransformState(cloneTransformState(defaultTransformState));
    setInitialTransform(cloneTransformState(defaultTransformState));
    setHasPlacedObject(false);
    setResetSignal((signal) => signal + 1);
  };

  const handleRecenter = () => {
    setTransformState(cloneTransformState(initialTransform));
  };

  const handleChatActions = (actions: TransformAction[]) => {
    if (!actions || actions.length === 0) return;
    setTransformState((current) => applyActionsToState(current, actions));
  };

  if (isARSupported === null) {
    return (
      <div style={loaderScreenStyle}>
        <div style={loaderAccentDot} />
        <p
          style={{
            margin: 0,
            fontSize: "1rem",
            color: "rgba(255,255,255,0.78)",
          }}
        >
          Verificando se seu dispositivo possui capacidades de AR...
        </p>
        <style>{pulseKeyframes}</style>
      </div>
    );
  }

  return (
    <div style={appShellStyle}>
      <Canvas
        shadows
        camera={{ position: [2, 2, 2], fov: 60 }}
        style={{ width: "100%", height: "100%", background: "transparent" }}
      >
        <Suspense fallback={<Loader />}>
          {isARSupported ? (
            <XR store={store}>
              <XREditor
                transformMode={transformMode}
                transformState={transformState}
                onTransformChange={handleTransformChange}
                onPlacement={handlePlacement}
                resetSignal={resetSignal}
                modelConfig={modelId ? getById(modelId) : undefined}
              />
            </XR>
          ) : (
            <DesktopScene
              transformMode={transformMode}
              transformState={transformState}
              onTransformChange={handleTransformChange}
              modelConfig={modelId ? getById(modelId) : undefined}
            />
          )}
        </Suspense>
      </Canvas>

      {isARSupported && (
        <button style={enterARButtonStyle} onClick={() => store.enterAR()}>
          Vamos lá!
        </button>
      )}

      <FloatingDock
        transformMode={transformMode}
        onModeChange={setTransformMode}
        onReset={handleReset}
        onRecenter={handleRecenter}
        recenterDisabled={!hasPlacedObject && isARSupported}
      />

      <button
        type="button"
        aria-label="Usage information"
        aria-pressed={isInfoOpen}
        onClick={() => setInfoOpen((open) => !open)}
        style={isInfoOpen ? infoButtonActiveStyle : infoButtonStyle}
      >
        <InfoIcon />
      </button>

      <InfoPanel
        isOpen={isInfoOpen}
        isAR={isARSupported}
        onClose={() => setInfoOpen(false)}
      />
      <ChatPanel onActions={handleChatActions} />
      <style>{pulseKeyframes}</style>
    </div>
  );
};
