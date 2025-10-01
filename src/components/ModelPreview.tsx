import React, { useRef, useEffect, useState, memo, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ModelConfig } from "../types/modelaConfig";
import { ModelWithFallback } from "./ModelWithFallback";
import { theme } from "../theme";

const previewSpinnerKeyframes = `@keyframes model-preview-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}`;

const previewOverlayStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.75rem",
  background: "linear-gradient(135deg, rgba(26,26,26,0.92), rgba(42,42,42,0.88))",
  color: theme.colors.white,
  fontFamily: theme.fonts.primary,
  borderRadius: "0.75rem",
  backdropFilter: "blur(8px)",
};

const previewSpinnerStyle: React.CSSProperties = {
  width: "3rem",
  height: "3rem",
  borderRadius: "50%",
  border: "3px solid rgba(255, 255, 255, 0.12)",
  borderTopColor: theme.colors.accent,
  animation: "model-preview-spin 0.9s linear infinite",
};

const previewLabelStyle: React.CSSProperties = {
  fontSize: "0.85rem",
  letterSpacing: "0.02em",
  color: "rgba(255, 255, 255, 0.86)",
};



// Internal component to capture screenshot and destroy scene
const ScreenshotCapture: React.FC<{
  onScreenshot: (dataUrl: string) => void;
}> = ({ onScreenshot }) => {
  const { gl, scene, camera } = useThree();
  const capturedRef = useRef(false);

  useEffect(() => {
    // Wait for model to load and render
    const timer = setTimeout(() => {
      if (!capturedRef.current) {
        // Calculate bounding box and fit camera
        const box = new THREE.Box3().setFromObject(scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Get the maximum dimension
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
        
        // Calculate distance needed to fit the object
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
        
        // Add some padding (50% extra distance)
        cameraZ *= 1.5;
        
        // Position camera to look at the center of the object
        const angle = Math.PI / 4; // 45 degrees for nice viewing angle
        camera.position.set(
          center.x + cameraZ * Math.cos(angle),
          center.y + cameraZ * 0.5, // Slightly elevated
          center.z + cameraZ * Math.sin(angle)
        );
        
        // Make camera look at the center of the object
        camera.lookAt(center);
        camera.updateProjectionMatrix();
        
        // Render the scene one final time
        gl.render(scene, camera);
        
        // Capture screenshot with transparency
        const dataUrl = gl.domElement.toDataURL('image/png', 1.0);
        onScreenshot(dataUrl);
        capturedRef.current = true;
      }
    }, 1000); // Give model time to load

    return () => clearTimeout(timer);
  }, [gl, scene, camera, onScreenshot]);

  return null;
};

// Simple scene for preview
const PreviewScene: React.FC<{
  modelConfig?: ModelConfig;
  onScreenshot: (dataUrl: string) => void;
}> = ({ modelConfig, onScreenshot }) => {
  const { gl } = useThree();
  
  useEffect(() => {
    // Set renderer clear color to black
    gl.setClearColor(0x18191b, 1.0);
  }, [gl]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[3, 3, 3]} 
        intensity={0.8}
      />
      <pointLight position={[-2, -2, -2]} intensity={0.3} />
      
      {/* Model */}
      <ModelWithFallback modelConfig={modelConfig} />
      
      {/* Screenshot capture */}
      <ScreenshotCapture onScreenshot={onScreenshot} />
    </>
  );
};

// Cached image component that only re-renders when screenshot changes
const CachedModelImage = memo<{
  screenshot: string;
  alt: string;
  className: string;
}>(({ screenshot, alt, className }) => {
  return (
    <img
      src={screenshot}
      alt={alt}
      className={className}
      style={{
        objectFit: 'contain',
        background: '#000000',
        borderRadius: '4px'
      }}
    />
  );
});

CachedModelImage.displayName = 'CachedModelImage';

// Main preview widget
export const ModelPreviewWidget: React.FC<{
  modelConfig?: ModelConfig;
  width?: number;
  height?: number;
  className?: string;
  alt?: string;
}> = memo(({
  modelConfig,
  width = 200,
  height = 200,
  className = "",
  alt = "3D Model Preview"
}) => {
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create a stable key for the model config to determine if we need to re-render
  const modelKey = useMemo(() => {
    if (!modelConfig) return 'no-model';
    return JSON.stringify(modelConfig);
  }, [modelConfig]);

  // Reset state when model changes
  useEffect(() => {
    setScreenshot(null);
    setIsLoading(true);
    setError(null);
  }, [modelKey]);

  const handleScreenshot = (dataUrl: string) => {
    setScreenshot(dataUrl);
    setIsLoading(false);
  };

  const handleError = () => {
    setError("Failed to load model preview");
    setIsLoading(false);
  };

  // If we have a screenshot, show the cached image
  if (screenshot) {
    return (
      <CachedModelImage
        screenshot={screenshot}
        alt={alt}
        className={className}
      />
    );
  }

  // Show error state
  if (error) {
    return (
      <div
        className={className}
        style={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          color: '#6c757d',
          fontSize: '12px',
          textAlign: 'center'
        }}
      >
        Preview unavailable
      </div>
    );
  }

  // Render 3D scene only while loading/capturing
  return (
    <div style={{ width, height, position: 'relative' }}>
      <Canvas
        style={{ width: '100%', height: '100%' }}
        camera={{ 
          position: [1.5, 1.5, 1.5], 
          fov: 45
        }}
        gl={{ 
          preserveDrawingBuffer: true,
          antialias: true,
          alpha: true
        }}
        onError={handleError}
      >
        <PreviewScene
          modelConfig={modelConfig}
          onScreenshot={handleScreenshot}
        />
      </Canvas>

      {/* Loading overlay */}
      {isLoading && (
        <div
          role="status"
          aria-live="polite"
          aria-label="Loading 3D preview"
          style={previewOverlayStyle}
        >
          <div style={previewSpinnerStyle} />
          <span style={previewLabelStyle}>Loading preview...</span>
          <style>{previewSpinnerKeyframes}</style>
        </div>
      )}
    </div>
  );
});

ModelPreviewWidget.displayName = 'ModelPreviewWidget';

// Thumbnail variant for smaller previews
export const ModelThumbnail: React.FC<{
  modelConfig?: ModelConfig;
  size?: number;
  className?: string;
}> = memo(({ modelConfig, size = 80, className = "" }) => {
  return (
    <ModelPreviewWidget
      modelConfig={modelConfig}
      width={size}
      height={size}
      className={className}
    />
  );
});

ModelThumbnail.displayName = 'ModelThumbnail';

export default ModelPreviewWidget;