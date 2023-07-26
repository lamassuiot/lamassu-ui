import React from "react";
import { Grid, Paper, Typography, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import { LamassuChip } from "components/LamassuComponents/Chip";
import moment from "moment";
import { CertificateAuthority, OCAStatus } from "ducks/features/cas/models";

interface Props {
    ca: CertificateAuthority
    selected: boolean,
    onClick?: any,
    style?: any
}

export const CertificateCard: React.FC<Props> = ({ ca, selected = false, onClick = () => { }, style = {} }) => {
    const theme = useTheme();
    const height = 120;

    return (
        <Box elevation={selected ? 4 : 1}
            component={Paper}
            onClick={onClick}
            style={{ width: "auto", height: height, borderRadius: 10, background: theme.palette.background.default, cursor: "pointer", ...style }}
        >
            <Box style={{ borderBottom: `1px solid ${theme.palette.divider}`, width: "100%", height: "60%" }}>
                <Grid container style={{ height: "100%", padding: "0 0 0 30px" }} justifyContent="center" alignItems="center">
                    <Grid item xs={8}>
                        <Typography style={{ color: theme.palette.text.secondary, fontWeight: "400", fontSize: 13 }}>#{`${ca.key_metadata.type} ${ca.key_metadata.bits}`}</Typography>
                        <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 20, lineHeight: "24px" }}>{ca.name}</Typography>
                    </Grid>
                    <Grid item xs={4} container direction="column" justifyContent="center" alignItems="center">
                        <Grid item>
                            <Typography style={{ color: theme.palette.text.secondary, fontWeight: "400", fontSize: 13 }}>Key Strength</Typography>
                        </Grid>
                        <Grid item>
                            <LamassuChip rounded label={ca.key_metadata.strength} color={ca.key_metadata.strength_color} style={{ width: "55px", marginTop: "5px" }} bold compact />
                        </Grid>
                    </Grid>
                </Grid>
            </Box>
            <Box style={{ height: "40%" }}>
                <Grid container style={{ height: "100%", padding: "0 30px" }} justifyContent="space-between" alignItems="center">
                    <Grid item xs="auto">
                        <Typography style={{ color: (ca.status === OCAStatus.REVOKED || ca.status === OCAStatus.EXPIRED) ? theme.palette.error.main : theme.palette.text.secondary, fontWeight: "400", fontSize: "13px" }}>{`${ca.status} · ${moment(ca.valid_to).format("DD/MM/YYYY")}`}</Typography>
                    </Grid>
                    <Grid item xs="auto">
                        {
                            !ca.with_private_key && (
                                <LamassuChip label={"READ-ONLY CA"} color={[theme.palette.primary.main, theme.palette.primary.light]} />
                            )
                        }
                    </Grid>
                </Grid>
            </Box>

            <Box style={{ width: 10, height: height * 0.6, borderTopRightRadius: 10, borderBottomRightRadius: 10, background: selected ? theme.palette.primary.main : "transparent", position: "relative", top: -height * 0.80 }} />
        </Box>
    );
};
