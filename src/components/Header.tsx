import type { CSSProperties } from "react";
import { Box, Flex, Heading } from "@radix-ui/themes";
import { Link } from "react-router-dom";

const headerStyle: CSSProperties = {
  background: "linear-gradient(180deg, rgba(24, 24, 27, 0.92) 0%, rgba(24, 24, 27, 0.65) 60%, rgba(24, 24, 27, 0) 100%)",
  boxShadow: "0 20px 40px rgba(10, 10, 15, 0.32)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
};

export const Header = () => (
  <Box as="header" className="px-6 py-4" style={headerStyle}>
    <Flex align="center" justify="between">
      <Link to="/" className="no-underline">
        <Heading
          size="4"
          weight="bold"
          color="gray"
          className="text-white tracking-tight hover:text-zinc-300 transition"
        >
          Tektai
        </Heading>
      </Link>
    </Flex>
  </Box>
);
