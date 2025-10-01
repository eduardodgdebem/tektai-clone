import React, { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { TransformControls as TransformControlsImpl } from "three/examples/jsm/controls/TransformControls";
import { OrbitControls, TransformControls, Grid, Box } from "@react-three/drei";
import { theme } from "../theme";
import { TransformMode } from "./ARScene";
import { TransformState, Vector3Tuple } from "../types/transform";
import { ModelConfig } from "../types/modelaConfig";
import { ModelWithFallback } from "./ModelWithFallback";

interface DesktopSceneProps {
  transformMode: TransformMode;
  transformState: TransformState;
  onTransformChange: (state: TransformState) => void;
  modelConfig?: ModelConfig;
}

export const DesktopScene: React.FC<DesktopSceneProps> = ({
  transformMode,
  transformState,
  onTransformChange,
  modelConfig,
}) => {
  const orbitControlsRef = useRef<React.ComponentRef<typeof OrbitControls>>(null);
  const transformControlsRef = useRef<TransformControlsImpl | null>(null);
  const meshGroupRef = useRef<THREE.Group>(null);
  const isUpdatingRef = useRef(false);
  const isDraggingRef = useRef(false);

  const [orbitControls, setOrbitControls] = useState<React.ComponentRef<
    typeof OrbitControls
  > | null>(null);
  const [transformControls, setTransformControls] =
    useState<TransformControlsImpl | null>(null);
  const [attachedObject, setAttachedObject] = useState<THREE.Group | null>(null);

  const handleOrbitControlsRef = useCallback(
    (value: React.ComponentRef<typeof OrbitControls> | null) => {
      orbitControlsRef.current = value;
      setOrbitControls(value);
    },
    []
  );

  const handleTransformControlsRef = useCallback(
    (value: TransformControlsImpl | null) => {
      transformControlsRef.current = value;
      setTransformControls(value);
    },
    []
  );

  const handleMeshGroupRef = useCallback((value: THREE.Group | null) => {
    meshGroupRef.current = value;
    setAttachedObject(value);
  }, []);

  useEffect(() => {
    if (!transformControls || !orbitControls) return;
    const toggleOrbit = (event: { value: boolean }) => {
      orbitControls.enabled = !event.value;
    };
    transformControls.addEventListener("dragging-changed", toggleOrbit);
    return () =>
      transformControls.removeEventListener("dragging-changed", toggleOrbit);
  }, [transformControls, orbitControls]);

  useEffect(() => {
    if (!transformControls || !attachedObject) return;
    transformControls.attach(attachedObject);
    return () => {
      if (transformControls.object === attachedObject) {
        transformControls.detach();
      }
    };
  }, [transformControls, attachedObject]);

  useEffect(() => {
    if (!attachedObject) return;
    if (isDraggingRef.current) return;
    isUpdatingRef.current = true;
    attachedObject.position.set(...transformState.position);
    attachedObject.rotation.set(...transformState.rotation);
    attachedObject.scale.set(...transformState.scale);
    attachedObject.updateMatrixWorld();
    if (transformControls) {
      transformControls.updateMatrixWorld();
    }
    isUpdatingRef.current = false;
  }, [transformState, transformControls, attachedObject]);

  const commitTransformState = () => {
    if (!meshGroupRef.current) return;
    const { position, rotation, scale } = meshGroupRef.current;
    const next: TransformState = {
      position: [position.x, position.y, position.z] as Vector3Tuple,
      rotation: [rotation.x, rotation.y, rotation.z] as Vector3Tuple,
      scale: [scale.x, scale.y, scale.z] as Vector3Tuple,
    };
    onTransformChange(next);
  };

  const handleObjectChange = () => {
    if (isUpdatingRef.current) return;
    if (!isDraggingRef.current) {
      commitTransformState();
    }
  };

  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[2, 5, 3]} intensity={3} castShadow />
      <Grid
        args={[20, 20]}
        position={[0, -0.5, 0]}
        fadeDistance={25}
        infiniteGrid
      />
      <OrbitControls
        ref={handleOrbitControlsRef}
        makeDefault
        dampingFactor={0.3}
      />
      <TransformControls
        ref={handleTransformControlsRef}
        mode={transformMode}
        onMouseDown={() => {
          isDraggingRef.current = true;
        }}
        onMouseUp={() => {
          isDraggingRef.current = false;
          commitTransformState();
        }}
        onTouchStart={() => {
          isDraggingRef.current = true;
        }}
        onTouchEnd={() => {
          isDraggingRef.current = false;
          commitTransformState();
        }}
        onObjectChange={handleObjectChange}
      >
        <group ref={handleMeshGroupRef}>
          <ModelWithFallback modelConfig={modelConfig} />
        </group>
      </TransformControls>
    </>
  );
};

export default DesktopScene;
