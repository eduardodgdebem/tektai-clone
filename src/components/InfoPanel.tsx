import React from "react";
import { theme } from "../theme";

interface InfoPanelProps {
  isOpen: boolean;
  isAR: boolean | null;
  onClose: () => void;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({
  isOpen,
  isAR,
  onClose,
}) => {
  if (!isOpen) return null;

  const heading = isAR ? "Instruções do Modo AR" : "Instruções do Visualizador 3D";

  return (
    <section
      style={{
        position: "absolute",
        top: "6.5rem",
        right: "1.5rem",
        width: "18rem",
        padding: "1rem",
        borderRadius: "1rem",
        background: theme.colors.dark + "e6",
        backdropFilter: "blur(10px)",
        boxShadow: "0 16px 36px rgba(0, 0, 0, 0.35)",
        color: theme.colors.white,
        fontFamily: theme.fonts.primary,
        zIndex: 40,
      }}
    >
      <header style={{ marginBottom: "0.75rem" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 600, margin: 0 }}>
          {heading}
        </h3>
      </header>
      <ul
        style={{
          listStyle: "disc",
          paddingInlineStart: "1.2rem",
          margin: 0,
          display: "grid",
          gap: "0.5rem",
          fontSize: "0.9rem",
        }}
      >
        {isAR ? (
          <>
            <li>Mova seu dispositivo para encontrar uma superfície plana.</li>
            <li>Aguarde até que o anel branco apareça na superfície.</li>
            <li>Toque uma vez para posicionar o cubo no seu espaço.</li>
            <li>Use os controles do gizmo para mover, girar ou escalar.</li>
          </>
        ) : (
          <>
            <li>
              <strong>Clique com o botão esquerdo e arraste</strong> para orbitar a câmera.
            </li>
            <li>
              <strong>Clique com o botão direito e arraste</strong> para mover a visão.
            </li>
            <li>
              <strong>Role a tela</strong> para aproximar ou afastar o zoom.
            </li>
            <li>Use os controles do gizmo para manipular o cubo.</li>
          </>
        )}
      </ul>
      <button
        onClick={onClose}
        style={{
          marginTop: "1rem",
          width: "100%",
          ...{
            backgroundColor: theme.colors.accent,
            color: theme.colors.dark,
            border: "none",
            borderRadius: "0.75rem",
            padding: "0.6rem 0.75rem",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: theme.fonts.primary,
          },
        }}
      >
        Entendi
      </button>
    </section>
  );
};

export default InfoPanel;
