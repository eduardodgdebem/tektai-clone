import { QRCodeSVG } from "qrcode.react";
import { useParams } from "react-router-dom";
import { useModelTable } from "../hooks/useModelTable";
import { Card, Heading, Text } from "@radix-ui/themes";
import { useState } from "react";

export const SharePage = () => {
  const { modelId } = useParams();
  const currentHost = window.location.origin;
  const renderUrl = `${currentHost}/render/${modelId}`;
  const [copied, setCopied] = useState(false);

  const { getById } = useModelTable();

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(renderUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  if (!modelId || !getById(modelId)) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <Card className="p-6 sm:p-8 rounded-xl shadow-lg max-w-sm w-full">
          <Text size="4" color="red" className="text-center">
            Model not found
          </Text>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-[calc(100dvh-56px)] px-4 py-6">
      <Card className="flex p-4 sm:p-6 md:p-8 rounded-xl shadow-2xl max-w-sm sm:max-w-md w-full">
        <div className="flex flex-col items-center gap-4 sm:gap-6 w-full">
          <Heading className="text-2xl sm:text-3xl md:text-4xl font-bold text-center">
            Scanei ou acesse
          </Heading>

          <Text
            size="2"
            className="sm:text-base text-center text-gray-200 leading-relaxed px-2"
          >
            Compartilhe este modelo facilmente escaneando o QR code ou acessando
            o link abaixo:
          </Text>

          <div className="bg-white p-3 sm:p-4 w-fit rounded-2xl shadow-md flex items-center justify-center">
            <QRCodeSVG
              value={renderUrl}
              size={window.innerWidth < 640 ? 140 : 160}
              level="M"
              includeMargin={true}
            />
          </div>

          <Text
            size="2"
            className="text-center break-all text-[var(--my-brand-color)] font-mono leading-relaxed px-2 text-xs sm:text-sm"
          >
            {renderUrl}
          </Text>

          <button
            onClick={handleCopyUrl}
                  className="bg-[var(--my-brand-color)] p-3 text-md font-bold text-[var(--accent-contrast)] rounded-lg text-center hover:brightness-90 transition"
            aria-label="Copy URL to clipboard"
          >
            {copied ? "✅ Copiado!" : "📋 Copiar Link"}
          </button>
        </div>
      </Card>
    </div>
  );
};
