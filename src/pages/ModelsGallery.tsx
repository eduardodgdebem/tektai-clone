import { useModelTable } from "../hooks/useModelTable";
import { Card } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";
import ModelPreview from "../components/ModelPreview";
import { ShareIcon } from "../components/icons/Icons";

export const ModelGallery = () => {
  const { models, getById } = useModelTable();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Que modelo você quer explorar?</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {models.map((model) => (
          <Card
            key={model.id}
            className="shadow-lg rounded-xl  hover:scale-[1.02] transition-all"
          >
            <header className="flex flex-col items-center p-3">
              <div className="w-40 h-40 rounded-full flex items-center justify-center mb-4">
                <ModelPreview modelConfig={getById(model.id)!} />
              </div>
              <h2 className="text-xl font-semibold">{model.name}</h2>
            </header>
            <main className="px-4 pb-4">
              <p className="text-gray-00 mb-4">{model.description}</p>
              <div className="flex gap-4">
                <button
                  className="bg-[var(--my-brand-color)] p-3 text-md font-bold text-[var(--accent-contrast)] rounded-lg text-center hover:brightness-90 transition"
                  onClick={() => navigate(`/render/${model.id}`)}
                >
                  Visualizar
                </button>
                <button
                  className="bg-[var(--my-brand-color)] p-3 text-md font-bold text-[var(--accent-contrast)] rounded-lg text-center hover:brightness-90 transition"
                  onClick={() => navigate(`/share/${model.id}`)}
                >
                  <ShareIcon />
                </button>
              </div>
            </main>
          </Card>
        ))}
      </div>
    </div>
  );
};
