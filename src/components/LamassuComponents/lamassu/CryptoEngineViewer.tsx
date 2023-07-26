import React, { useState } from "react";
import { CryptoEngine } from "ducks/features/cav3/apicalls";
import { Grid, Box, Paper, Typography, IconButton, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import { MultiKeyValueInput } from "../dui/MultiKeyValueInput";

const engines = [
    {
        uniqueID: "AWS_SECRETS_MANAGER",
        icon: process.env.PUBLIC_URL + "/assets/AWS-SM.png"
    },
    {
        uniqueID: "AWS_KMS",
        icon: process.env.PUBLIC_URL + "/assets/AWS-KMS.png"
    },
    {
        uniqueID: "VaultKV2",
        icon: process.env.PUBLIC_URL + "/assets/HASHICORP-VAULT.png"
    },
    {
        uniqueID: "HSM-B",
        icon: process.env.PUBLIC_URL + "/assets/HSM-BLUE.png"
    },
    {
        uniqueID: "HSM-B1",
        icon: process.env.PUBLIC_URL + "/assets/HSM-BLUE-1.png"
    },
    {
        uniqueID: "HSM",
        icon: process.env.PUBLIC_URL + "/assets/HSM-GREEN.png"
    },
    {
        uniqueID: "GOLANG",
        icon: process.env.PUBLIC_URL + "/assets/golang.png"
    }
];

export interface CryptoEngineViewerProps {
    engine: CryptoEngine,
    simple?: boolean,
    withDebugMetadata?: boolean,
}

export const CryptoEngineViewer: React.FC<CryptoEngineViewerProps> = ({ engine, simple = false, withDebugMetadata = false }) => {
    const [showMeta, setShowMeta] = useState(false);
    return (
        <Grid container spacing={2} alignItems={"center"}>
            <Grid item xs={"auto"}>
                <Box component={Paper} sx={{ height: "40px", width: "40px" }}>
                    <img src={engines.find(eng => eng.uniqueID === engine.type)?.icon} height={"100%"} width={"100%"} />
                </Box>
            </Grid>
            {
                !simple && (
                    <Grid item xs={"auto"} container spacing={4} alignItems={"center"}>
                        <Grid item>
                            <Typography fontWeight={"500"} fontSize={"14px"}>{engine.provider}</Typography>
                            <Typography fontWeight={"400"} fontSize={"14px"}>{engine.name}</Typography>
                        </Grid>
                        <Grid item>
                            <Typography fontWeight={"400"} fontSize={"12px"}></Typography>
                            <Typography fontWeight={"400"} fontSize={"12px"}></Typography>
                        </Grid>
                    </Grid>
                )
            }
            {
                withDebugMetadata && (
                    <>
                        <Grid item xs container justifyContent={"flex-end"}>
                            <IconButton onClick={(ev) => { ev.stopPropagation(); ev.preventDefault(); setShowMeta(true); }}>
                                <RemoveRedEyeIcon />
                            </IconButton>
                        </Grid>
                        <Dialog open={showMeta} onClose={() => setShowMeta(false)} fullWidth maxWidth={"lg"}>
                            <DialogTitle>
                                <Grid container spacing={"40px"}>
                                    <Grid item xs="auto">
                                        <Typography variant="h2" sx={{ fontWeight: "500", fontSize: "1.25rem" }}>Engine Metadata</Typography>
                                    </Grid>
                                </Grid>
                            </DialogTitle>
                            <DialogContent>
                                <MultiKeyValueInput value={new Map(Object.entries(engine.metadata))} label="" disable={true} />
                            </DialogContent>
                            <DialogActions>
                                <Grid container>
                                    <Grid item xs>
                                        <Button onClick={() => setShowMeta(false)}>Close</Button>
                                    </Grid>
                                </Grid>
                            </DialogActions>
                        </Dialog>
                    </>
                )
            }
        </Grid>
    );
};
