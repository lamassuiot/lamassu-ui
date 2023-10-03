import { pSBC } from "./colors";

export const getColor = (theme: any, color: string | [string, string]) => {
    switch (color) {
    case "green":
        return [theme.palette.success.main, theme.palette.mode === "light" ? pSBC(0.7, theme.palette.success.main) : pSBC(-0.8, theme.palette.success.main)];

    case "orange":
        return [theme.palette.warning.main, theme.palette.mode === "light" ? pSBC(0.5, theme.palette.warning.main) : pSBC(-0.8, theme.palette.warning.main)];

    case "red":
        return [theme.palette.error.main, theme.palette.mode === "light" ? pSBC(0.5, theme.palette.error.main) : pSBC(-0.8, theme.palette.error.main)];

    case "blue":
        return [theme.palette.blue.main, theme.palette.mode === "light" ? pSBC(0.5, theme.palette.blue.main) : pSBC(-0.8, theme.palette.blue.main)];

    case "gray":
        return [theme.palette.text.main, theme.palette.background.lightContrast];

    default:
        if (color !== undefined) {
            return color;
        }
        return [theme.palette.text.main, theme.palette.background.lightContrast];
    }
};
