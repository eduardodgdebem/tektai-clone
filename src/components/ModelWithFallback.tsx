import React, {
  
  useEffect,
  useMemo,
  useState,
} from "react";
import * as THREE from "three";
import {  useGLTF, Text } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { theme } from "../theme";
import { Vector3Tuple } from "../types/transform";
import { ModelConfig } from "../types/modelaConfig";

// Component for loading GLB models
export const GLBModel: React.FC<{
  url: string;
  scale?: number;
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
}> = ({ url, scale = 1, position = [0, 0, 0], rotation = [0, 0, 0] }) => {
  const { scene } = useGLTF(url);

  // Clone the scene to avoid issues with multiple instances
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  useEffect(() => {
    clonedScene.scale.setScalar(scale);
    clonedScene.position.set(...position);
    clonedScene.rotation.set(...rotation);
  }, [clonedScene, scale, position, rotation]);

  return <primitive object={clonedScene} />;
};

// Component for loading OBJ models
export const OBJModel: React.FC<{
  url: string;
  scale?: number;
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
}> = ({ url, scale = 1, position = [0, 0, 0], rotation = [0, 0, 0] }) => {
  const obj = useLoader(OBJLoader, url);

  // Clone the object to avoid issues with multiple instances
  const clonedObj = useMemo(() => obj.clone(), [obj]);

  useEffect(() => {
    clonedObj.scale.setScalar(scale);
    clonedObj.position.set(...position);
    clonedObj.rotation.set(...rotation);

    // Apply a default material if the OBJ doesn't have one
    clonedObj.traverse((child) => {
      if (child instanceof THREE.Mesh && !child.material) {
        child.material = new THREE.MeshStandardMaterial({
          color: theme.colors.primary,
        });
      }
    });
  }, [clonedObj, scale, position, rotation]);

  return <primitive object={clonedObj} />;
};

// Error boundary component for model loading
export const ModelWithFallback: React.FC<{
  modelConfig?: ModelConfig;
}> = ({ modelConfig }) => {
  const [error, setError] = useState<string | null>(null);

  if (!modelConfig) {
    // Default fallback to original box
    return (
      <mesh>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color={theme.colors.primary} />
      </mesh>
    );
  }

  if (error) {
    return (
      <group>
        <mesh>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#ff6b6b" />
        </mesh>
        <Text
          position={[0, 0.8, 0]}
          fontSize={0.1}
          color="#ff6b6b"
          anchorX="center"
          anchorY="middle"
        >
          Model Load Error
        </Text>
      </group>
    );
  }

  try {
    if (modelConfig.type === "glb") {
      return (
        <GLBModel
          url={modelConfig.url}
          scale={modelConfig.scale}
          position={modelConfig.position}
          rotation={modelConfig.rotation}
        />
      );
    } else if (modelConfig.type === "obj") {
      return (
        <OBJModel
          url={modelConfig.url}
          scale={modelConfig.scale}
          position={modelConfig.position}
          rotation={modelConfig.rotation}
        />
      );
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : "Unknown error");
  }

  // Fallback to box if type is not supported
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color={theme.colors.primary} />
    </mesh>
  );
};
