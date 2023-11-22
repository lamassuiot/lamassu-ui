import React from "react";
import { Grid, Paper, Typography, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import { LamassuChip } from "components/LamassuComponents/Chip";
import moment from "moment";
import { CertificateAuthority, CertificateStatus, CryptoEngine } from "ducks/features/cav3/models";
import { CryptoEngineViewer } from "components/LamassuComponents/lamassu/CryptoEngineViewer";

interface Props {
    ca: CertificateAuthority
    engine: CryptoEngine
    selected: boolean,
    elevation?: boolean,
    onClick?: any,
    style?: any
}

export const CertificateCard: React.FC<Props> = ({ ca, engine, elevation = true, selected = false, onClick = () => { }, style = {} }) => {
    const theme = useTheme();
    const height = 120;

    const card = (
        <>
            <Box style={{ borderBottom: `1px solid ${theme.palette.divider}`, width: "100%", height: "60%" }}>
                <Grid container style={{ height: "100%", padding: "0 10px 0 20px" }} justifyContent="center" alignItems="center" spacing={1}>
                    {
                        ca.type !== "EXTERNAL" && (
                            <Grid item xs="auto">
                                <CryptoEngineViewer engine={engine} simple />
                            </Grid>
                        )
                    }
                    <Grid item xs>
                        <Typography style={{ color: theme.palette.text.secondary, fontWeight: "400", fontSize: 13 }}>{`${ca.key_metadata.type} ${ca.key_metadata.bits} - ${ca.key_metadata.strength}`}</Typography>
                        <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 20, lineHeight: "24px" }}>{ca.subject.common_name}</Typography>
                        <Typography style={{ color: theme.palette.text.secondary, fontWeight: "400", fontSize: 12 }}>{ca.id}</Typography>
                    </Grid>
                    <Grid item xs="auto" container direction="column" justifyContent="center" alignItems="center">
                        <Grid item>
                            <Typography style={{ color: theme.palette.text.secondary, fontWeight: "400", fontSize: 13 }}>Hierarchy Level</Typography>
                        </Grid>
                        <Grid item>
                            <LamassuChip rounded label={ca.level === 0 ? "ROOT" : `Level ${ca.level}`} style={{ width: "55px", marginTop: "5px" }} bold compact />
                        </Grid>
                    </Grid>
                </Grid>
            </Box>
            <Box style={{ height: "40%" }}>
                <Grid container style={{ height: "100%", padding: "0 10px 0 20px" }} justifyContent="space-between" alignItems="center">
                    <Grid item xs={8}>
                        {
                            ca.status !== CertificateStatus.Active
                                ? (
                                    <LamassuChip
                                        color={"red"}
                                        label={
                                            `${ca.status} · ${moment(ca.valid_to).format("DD/MM/YYYY")} ·  ${moment.duration(moment().diff(moment(ca.status === CertificateStatus.Revoked ? ca.revocation_timestamp : ca.valid_to))).humanize(true)}`
                                        }
                                    />
                                )
                                : (
                                    <Typography style={{ fontWeight: "400", fontSize: "13px" }} >{`${ca.status} · ${moment(ca.valid_to).format("DD/MM/YYYY")} ·  ${moment.duration(moment().diff(moment(ca.valid_to))).humanize(true)}`}</Typography>
                                )
                        }
                    </Grid>
                    <Grid item xs="auto">
                        {
                            ca.type !== "MANAGED" && (
                                <LamassuChip label={ca.type} color={[theme.palette.primary.main, theme.palette.primary.light]} />
                            )
                        }
                    </Grid>
                </Grid>
            </Box>
        </>
    );

    if (!elevation) {
        return card;
    }

    return (
        <>
            <Box elevation={selected ? 4 : 1}
                component={Paper}
                onClick={onClick}
                style={{ width: "auto", height: height, borderRadius: 10, background: theme.palette.background.default, cursor: "pointer", ...style }}
            >
                {
                    card
                }
                <Box style={{ width: 10, height: height * 0.6, borderTopRightRadius: 10, borderBottomRightRadius: 10, background: selected ? theme.palette.primary.main : "transparent", position: "relative", top: -height * 0.80 }} />
            </Box >
        </>
    );
};
