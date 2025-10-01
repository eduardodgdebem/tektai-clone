import { useState } from "react";
import { ModelConfig } from "../types/modelaConfig";

const mockedModels: ModelConfig[] = [
  {
    id: "1",
    name: "Cubo",
    url: "/models/cube.obj",
    description: "Um cubo.",
    isLocal: false,
    type: "obj",
  },
  {
    id: "2",
    name: "Datacenter",
    url: "/models/data_center_low-poly.glb",
    description: "Servidores de um datacenter.",
    isLocal: false,
    type: "glb",
  },
  {
    id: "3",
    name: "Xícara de Café",
    url: "/models/bakedModel.glb",
    description: "Uma xícara de café.",
    isLocal: false,
    type: "glb",
  },
  {
    id: "4",
    name: "Planta",
    url: "/models/eb_house_plant_01.glb",
    description: "Uma planta.",
    isLocal: false,
    type: "glb",
  },
  {
    id: "5",
    name: "Esqueleto",
    url: "/models/skeleton.obj",
    description: "Um esqueleto.",
    isLocal: false,
    type: "obj",
  },
  {
    id: "6",
    name: "Esfera",
    url: "/models/sphere.obj",
    description: "Uma esfera.",
    isLocal: false,
    type: "obj",
  },
];

export const useModelTable = () => {
  const [models, setModels] = useState<ModelConfig[]>(mockedModels);
  const [currentModel, setCurrentModel] = useState<ModelConfig | null>(null);

  const getById = (modelId: string): ModelConfig | undefined => {
    return models.find((m) => m.id === modelId);
  };

  const removeModel = (modelId: string) => {
    const model = models.find((m) => m.id === modelId);
    if (!model) {
      return;
    }

    setModels((prev) => prev.filter((m) => m.id !== modelId));

    if (currentModel?.id === modelId) {
      setCurrentModel(null);
    }
  };

  const updateModel = (modelId: string, updatedFields: Partial<ModelConfig>) => {
    const exists = models.find((m) => m.id === modelId);
    if (!exists) {
      return;
    }

    setModels((prev) =>
      prev.map((m) => (m.id === modelId ? { ...m, ...updatedFields } : m)),
    );
  };

  const loadModel = (modelId: string) => {
    const model = models.find((m) => m.id === modelId);
    if (!model) {
      return;
    }

    setCurrentModel(model);
  };

  return {
    models,
    currentModel,
    setCurrentModel,
    removeModel,
    updateModel,
    loadModel,
    getById,
  };
};
