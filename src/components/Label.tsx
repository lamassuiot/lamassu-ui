import { FC, ReactNode } from "react";
import { SxProps, alpha, lighten, styled, useTheme } from "@mui/material/styles";
import { grey } from "@mui/material/colors";

export type BasicColor = "primary"
  | "black"
  | "secondary"
  | "error"
  | "warning"
  | "success"
  | "info"
  | "grey";

interface LabelProps {
  className?: string;
  color?: BasicColor | [string, string] | string
  size?: "small" | "medium" | "large";
  transparency?: number;
  children?: ReactNode
  onClick?: () => void | undefined,
}

const LabelWrapper = styled("span")(
    ({ theme }) => `
      background-color: ${theme.colors.alpha.black[5]};
      border-radius: ${theme.general.borderRadius};
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: ${theme.spacing(0.5, 1)};
      font-size: ${theme.typography.pxToRem(13)};
      max-height: ${theme.spacing(3)};      
`
);

const Label: FC<LabelProps> = ({
    className,
    color = "grey",
    children,
    size = "medium",
    transparency = 1,
    onClick = undefined,
    ...rest
}) => {
    const theme = useTheme();
    const btnStyle: SxProps = { cursor: onClick !== undefined ? "pointer" : "" };

    if (Array.isArray(color)) {
        return <LabelWrapper sx={{ background: alpha(color[1], transparency), color: color[0], ...btnStyle }} onClick={onClick} {...rest}>
            {children}
        </LabelWrapper>;
    }

    let fg: string = grey[600];
    let bg: string = grey[200];

    switch (color) {
    case "primary":
        fg = theme.palette.primary.main;
        bg = lighten(theme.palette.primary.light, 0.6);
        break;
    case "black":
        fg = theme.colors.alpha.white[100];
        bg = theme.colors.alpha.black[100];
        break;
    case "secondary":
        fg = theme.colors.alpha.white[100];
        bg = theme.colors.secondary.lighter;
        break;
    case "success":
        fg = theme.palette.success.main;
        bg = lighten(theme.palette.success.light, 0.6);
        break;
    case "warning":
        fg = theme.colors.alpha.white[100];
        bg = theme.colors.warning.lighter;
        break;
    case "error":
        fg = theme.colors.alpha.white[100];
        bg = theme.palette.error.main;
        break;
    }

    let padding: string = theme.spacing(0.5, 1);
    let fontSize: string = theme.typography.pxToRem(13);
    let maxHeight: string = theme.spacing(3);

    switch (size) {
    case "small":
        padding = theme.spacing(0.25, 0.5);
        fontSize = theme.typography.pxToRem(11);
        maxHeight = theme.spacing(2);
        break;
    case "large":
        padding = theme.spacing(0.75, 1.5);
        fontSize = theme.typography.pxToRem(16);
        maxHeight = theme.spacing(4);
        break;
    }

    return (
        <LabelWrapper sx={{ ...btnStyle, color: fg + "!important", background: alpha(bg, transparency), padding, fontSize, maxHeight }} onClick={onClick} {...rest}>
            {children}
        </LabelWrapper>
    );
};

export default Label;
