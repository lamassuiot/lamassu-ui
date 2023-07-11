import React from "react";
import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/system";

interface ChipProps {
    color?: "success" | "warn" | "error" | "info",
    label: string,
    rounded?: boolean,
    compact?: boolean,
    bold?: boolean,
    compactFontSize?: boolean,
    style?: any,
}
const Chip: React.FC<ChipProps> = ({ color, label, rounded, compact = false, bold = false, compactFontSize = false, style = {}, ...props }) => {
    const theme = useTheme();
    const defaultColors: [string, string] = theme.palette.mode === "dark" ? ["#EEE", "#555"] : ["#555", "#EEEEEE"];
    const colors = defaultColors;

    return (
        <Box style={{ background: colors[1], borderRadius: rounded ? 15 : 5, padding: compact ? "3px" : "5px 7px 5px 7px", width: "fit-content", display: "flex", justifyContent: "center", alignItems: "center", ...style }} {...props}>
            <Typography style={{ color: colors[0], fontWeight: bold ? "600" : "400", fontSize: compactFontSize ? 10 : 12 }}>{label}</Typography>
        </Box>
    );
};

export { Chip }; export type { ChipProps };

// interface StatusChipProps {
//     color: string | [string, string],
//     label: string,
//     style?: any,
// }
// export const StatusChip: React.FC<StatusChipProps> = ({ color, label, style = {}, ...props }) => {
//     const theme = useTheme();
//     const colors = getColor(theme, color);
//     return (
//         <Box style={{ background: colors[1], borderRadius: 5, marginLeft: 10, padding: "5px 7px 5px 7px", width: "fit-content", display: "flex", justifyContent: "center", alignItems: "center", ...style }} {...props}>
//             <Box style={{ marginRight: 10, width: 7, height: 7, background: colors[0], borderRadius: "50%" }} />
//             <Typography style={{ color: colors[0], fontWeight: "400", fontSize: 12 }}>{label}</Typography>
//         </Box>
//     );
// };
