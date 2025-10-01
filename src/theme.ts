export const theme = {
  colors: {
    primary: "#0D47A1",
    secondary: "#00BCD4",
    accent: "#FFB300",
    dark: "#212121",
    white: "#FFFFFF",
    gray: {
      900: "#1a1a1a",
      800: "#2a2a2a",
      700: "#3a3a3a",
      600: "#4a4a4a",
      500: "#6a6a6a",
    },
  },
  fonts: {
    primary: "Lexend, sans-serif",
  },
};

export const styles = {
  button: {
    primary: `
      background-color: ${theme.colors.primary};
      color: ${theme.colors.white};
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-family: ${theme.fonts.primary};
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    `,
    accent: `
      background-color: ${theme.colors.accent};
      color: ${theme.colors.dark};
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-family: ${theme.fonts.primary};
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    `,
    secondary: `
      background-color: ${theme.colors.secondary};
      color: ${theme.colors.white};
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-family: ${theme.fonts.primary};
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    `,
  },
  ui: {
    panel: `
      background-color: ${theme.colors.dark}cc;
      backdrop-filter: blur(8px);
      border-radius: 0.75rem;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
    `,
    controlButton: (isActive: boolean) => `
      padding: 0.5rem;
      border-radius: 0.375rem;
      transition: all 0.2s ease;
      background-color: ${isActive ? theme.colors.primary : "transparent"};
      color: ${theme.colors.white};
      border: none;
      cursor: pointer;
      font-family: ${theme.fonts.primary};
    `,
    accentButton: `
      background-color: ${theme.colors.accent};
      color: ${theme.colors.dark};
      padding: 0.5rem;
      border-radius: 0.375rem;
      border: none;
      cursor: pointer;
      font-family: ${theme.fonts.primary};
      font-weight: 600;
      transition: all 0.2s ease;
    `,
  },
};
