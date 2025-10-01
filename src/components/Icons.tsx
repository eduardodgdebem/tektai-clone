import React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;

const baseProps: Partial<IconProps> = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const MoveIcon: React.FC<IconProps> = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M5 9l-3 3 3 3" />
    <path d="M9 5l3-3 3 3" />
    <path d="M15 19l-3 3-3-3" />
    <path d="M19 9l3 3-3 3" />
    <path d="M2 12h20" />
    <path d="M12 2v20" />
  </svg>
);

export const RotateIcon: React.FC<IconProps> = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M20 12h-2a8 8 0 1 0-6.3 7.8" />
    <path d="M20 12V6.5" />
    <path d="M20 12l-4-4" />
  </svg>
);

export const ScaleIcon: React.FC<IconProps> = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M21 21l-6-6" />
    <path d="M21 21v-4" />
    <path d="M21 21h-4" />
    <path d="M3 3l6 6" />
    <path d="M3 3v4" />
    <path d="M3 3h4" />
  </svg>
);

export const ResetIcon: React.FC<IconProps> = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M3 2v6h6" />
    <path d="M21 12A9 9 0 0 0 6.49 4.36L2 9" />
  </svg>
);

export const RecenterIcon: React.FC<IconProps> = (props) => (
  <svg {...baseProps} {...props}>
    <circle cx="12" cy="12" r="8" />
    <line x1="12" y1="4" x2="12" y2="8" />
    <line x1="12" y1="16" x2="12" y2="20" />
    <line x1="4" y1="12" x2="8" y2="12" />
    <line x1="16" y1="12" x2="20" y2="12" />
  </svg>
);

interface MenuIconProps extends IconProps {
  open: boolean;
}

export const MenuIcon: React.FC<MenuIconProps> = ({ open, ...rest }) => (
  <svg {...baseProps} {...rest}>
    {open ? (
      <line x1="18" y1="6" x2="6" y2="18" />
    ) : (
      <line x1="3" y1="12" x2="21" y2="12" />
    )}
    {open ? (
      <line x1="6" y1="6" x2="18" y2="18" />
    ) : (
      <line x1="3" y1="6" x2="21" y2="6" />
    )}
    {!open && <line x1="3" y1="18" x2="21" y2="18" />}
  </svg>
);

export const InfoIcon: React.FC<IconProps> = (props) => (
  <svg {...baseProps} {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);
