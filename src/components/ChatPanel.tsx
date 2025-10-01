import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { theme } from "../theme";
import { TransformAction, CommandResponse } from "../types/actions";

interface ChatPanelProps {
  onActions: (actions: TransformAction[]) => void;
}

type ChatRole = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  isError?: boolean;
}

const panelStyle: React.CSSProperties = {
  position: "fixed",
  bottom: "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)",
  right: "calc(env(safe-area-inset-right, 0px) + 1.5rem)",
  width: "min(22rem, calc(100vw - 3rem))",
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
  padding: "1rem",
  borderRadius: "1rem",
  background: theme.colors.dark + "f2",
  color: theme.colors.white,
  fontFamily: theme.fonts.primary,
  backdropFilter: "blur(12px)",
  boxShadow: "0 16px 48px rgba(0, 0, 0, 0.45)",
  zIndex: 50,
};

const mobilePanelStyle: React.CSSProperties = {
  right: "auto",
  left: "50%",
  transform: "translateX(-50%)",
  bottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)",
  width: "calc(100vw - 2rem)",
  maxWidth: "24rem",
  padding: "0.85rem",
  gap: "0.65rem",
};

const mobileScrollAreaStyle: React.CSSProperties = {
  minHeight: "6rem",
  maxHeight: "40vh",
};

const scrollAreaStyle: React.CSSProperties = {
  minHeight: "7.5rem",
  maxHeight: "13rem",
  overflowY: "auto",
  padding: "0.75rem",
  borderRadius: "0.75rem",
  background: "rgba(255, 255, 255, 0.05)",
  fontSize: "0.9rem",
  color: "rgba(255,255,255,0.9)",
  display: "grid",
  gap: "0.75rem",
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  borderRadius: "0.75rem",
  border: "none",
  padding: "0.65rem 0.85rem",
  fontFamily: theme.fonts.primary,
  fontSize: "0.95rem",
  background: "rgba(255, 255, 255, 0.12)",
  color: theme.colors.white,
  outline: "none",
};

const sendButtonStyle: React.CSSProperties = {
  backgroundColor: theme.colors.accent,
  color: theme.colors.dark,
  border: "none",
  borderRadius: "0.75rem",
  padding: "0.6rem 1rem",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: theme.fonts.primary,
  transition: "opacity 0.2s ease",
};

const systemMessage =
  'Olá, eu sou a assistente Tektai! Fale comigo para manipular o objeto.';

const createMessage = (
  role: ChatRole,
  text: string,
  isError = false,
): ChatMessage => ({
  id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  role,
  text,
  isError,
});

export const ChatPanel: React.FC<ChatPanelProps> = ({ onActions }) => {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "intro", role: "assistant", text: systemMessage },
  ]);
  const [isSending, setSending] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const updateMatches = () => setIsMobile(mediaQuery.matches);

    updateMatches();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateMatches);
      return () => mediaQuery.removeEventListener("change", updateMatches);
    }

    mediaQuery.addListener(updateMatches);
    return () => mediaQuery.removeListener(updateMatches);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setKeyboardOffset(0);
      return undefined;
    }

    if (typeof window === "undefined" || !window.visualViewport) {
      setKeyboardOffset(0);
      return undefined;
    }

    const viewport = window.visualViewport;
    const handleViewportChange = () => {
      const heightDiff =
        window.innerHeight - (viewport.height + viewport.offsetTop);
      const nextOffset = Math.max(0, Math.round(heightDiff));
      setKeyboardOffset((prev) =>
        Math.abs(prev - nextOffset) > 1 ? nextOffset : prev
      );
    };

    handleViewportChange();
    viewport.addEventListener("resize", handleViewportChange);
    viewport.addEventListener("scroll", handleViewportChange);

    return () => {
      viewport.removeEventListener("resize", handleViewportChange);
      viewport.removeEventListener("scroll", handleViewportChange);
    };
  }, [isMobile]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const appliedPanelStyle = useMemo<React.CSSProperties>(() => {
    const merged = isMobile
      ? { ...panelStyle, ...mobilePanelStyle }
      : { ...panelStyle };

    const baseBottomExpression = isMobile
      ? "env(safe-area-inset-bottom, 0px) + 1rem"
      : "env(safe-area-inset-bottom, 0px) + 1.5rem";

    const bottom =
      keyboardOffset > 0
        ? `calc(${baseBottomExpression} + ${keyboardOffset}px)`
        : `calc(${baseBottomExpression})`;

    return {
      ...merged,
      bottom,
    };
  }, [isMobile, keyboardOffset]);

  const appliedScrollAreaStyle = useMemo<React.CSSProperties>(() => {
    if (isMobile) {
      return { ...scrollAreaStyle, ...mobileScrollAreaStyle };
    }
    return scrollAreaStyle;
  }, [isMobile]);

  const renderMessage = useCallback((message: ChatMessage) => {
    const alignment = message.role === "user" ? "flex-end" : "flex-start";
    let bubbleColor =
      message.role === "user"
        ? theme.colors.accent
        : "rgba(255, 255, 255, 0.12)";
    let bubbleText =
      message.role === "user" ? theme.colors.dark : theme.colors.white;
    if (message.isError) {
      bubbleColor = "rgba(255, 86, 86, 0.15)";
      bubbleText = "#ffaaaa";
    }

    return (
      <div
        key={message.id}
        style={{ display: "flex", justifyContent: alignment }}
      >
        <div
          style={{
            maxWidth: "85%",
            background: bubbleColor,
            color: bubbleText,
            borderRadius: "0.75rem",
            padding: "0.4rem 0.7rem",
            lineHeight: 1.25,
            fontWeight: 500,
            border: message.isError
              ? "1px solid rgba(255, 86, 86, 0.45)"
              : "none",
          }}
        >
          {message.text}
        </div>
      </div>
    );
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const input = draft.trim();
    if (!input || isSending) return;

    const userMessage = createMessage("user", input);
    setMessages((prev) => [...prev, userMessage]);
    setDraft("");
    setSending(true);

    try {
      const response = await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error("Não foi possível acessar o serviço de comandos.");
      }

      const payload = (await response.json()) as CommandResponse;
      if (payload?.reply) {
        setMessages((prev) => [
          ...prev,
          createMessage("assistant", payload.reply),
        ]);
      }
      if (Array.isArray(payload?.actions) && payload.actions.length) {
        onActions(payload.actions as TransformAction[]);
      }
    } catch (error: any) {
      const fallback =
        error?.message ?? "Algo deu errado. Por favor, tente novamente.";
      setMessages((prev) => [
        ...prev,
        createMessage("assistant", fallback, true),
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <section aria-label="Chat de comandos" style={appliedPanelStyle}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>
          Chat da Sessão
        </h2>
        <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.65)" }}>
          {isSending ? "Pensando..." : "Pronto"}
        </span>
      </header>
      <div ref={scrollRef} style={appliedScrollAreaStyle}>
        {messages.map(renderMessage)}
      </div>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.5rem" }}>
        <input
          type="text"
          placeholder="ex: rotacionar 30 graus no eixo Y"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          style={inputStyle}
          disabled={isSending}
        />
        <button
          type="submit"
          style={{ ...sendButtonStyle, opacity: isSending ? 0.5 : 1 }}
          disabled={isSending}
        >
          Enviar
        </button>
      </form>
    </section>
  );
};

export default ChatPanel;
