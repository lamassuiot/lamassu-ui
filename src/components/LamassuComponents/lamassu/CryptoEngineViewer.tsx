import React, { useState } from "react";
import { CryptoEngine } from "ducks/features/cav3/apicalls";
import { Grid, Box, Paper, Typography, IconButton, Button, Dialog, DialogActions, DialogContent, useTheme } from "@mui/material";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import { MultiKeyValueInput } from "../dui/MultiKeyValueInput";
import { SubsectionTitle } from "../dui/typographies";
import { KeyValueLabel } from "../dui/KeyValueLabel";
import { pSBC } from "components/utils/colors";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import { LamassuChip } from "../Chip";

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
        uniqueID: "PKCS11",
        icon: process.env.PUBLIC_URL + "/assets/PKCS11.png"
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
    style?: React.CSSProperties
}

export const CryptoEngineViewer: React.FC<CryptoEngineViewerProps> = ({ engine, simple = false, withDebugMetadata = false, style = {} }) => {
    const theme = useTheme();
    const [showMeta, setShowMeta] = useState(false);

    let slLabel = <></>;
    switch (engine.security_level) {
    case 0:
        slLabel = <Typography sx={{ padding: "3px 5px", borderRadius: "2px", background: pSBC(0.5, theme.palette.error.light), color: pSBC(-0.5, theme.palette.error.main) }}>Low (0)</Typography>;
        break;
    case 1:
        slLabel = <Typography sx={{ padding: "3px 5px", borderRadius: "2px", background: pSBC(0.5, theme.palette.warning.light), color: pSBC(-0.5, theme.palette.warning.main) }}>Medium (1)</Typography>;
        break;
    case 2:
        slLabel = <Typography sx={{ padding: "3px 5px", borderRadius: "2px", background: pSBC(0.5, theme.palette.success.light), color: pSBC(-0.5, theme.palette.success.main) }}>High (2)</Typography>;
        break;

    default:
        slLabel = <Typography sx={{ padding: "3px", background: pSBC(0.01, theme.palette.grey) }}>Unknown</Typography>;
        break;
    }

    return (
        <Grid container spacing={2} alignItems={"center"} sx={{ ...style }}>
            <Grid item xs={"auto"}>
                <Box component={Paper} sx={{ height: "40px", width: "40px" }}>
                    <img src={engines.find(eng => eng.uniqueID === engine.type)?.icon} height={"100%"} width={"100%"} />
                </Box>
            </Grid>
            {
                !simple && (
                    <>
                        <Grid item xs={"auto"}>
                            <Typography fontWeight={"500"} fontSize={"14px"}>{engine.provider}</Typography>
                            <Typography fontWeight={"400"} fontSize={"14px"}>{engine.name}</Typography>
                        </Grid>
                        {
                            engine.default && (
                                <>
                                    <Grid item xs={"auto"}>
                                        <Typography>|</Typography>
                                    </Grid>
                                    <Grid item xs={"auto"}>
                                        <LamassuChip label={"DEFAULT ENGINE"} color={[theme.palette.primary.main, theme.palette.primary.light]} />
                                    </Grid>
                                </>
                            )
                        }
                    </>
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
                        <Dialog open={showMeta} onClose={(ev: any) => {
                            console.log(ev); ev.stopPropagation(); setShowMeta(false);
                        }} fullWidth maxWidth={"lg"}>
                            <DialogContent onClick={(ev: any) => { console.log(ev); ev.stopPropagation(); }} >
                                <Grid container flexDirection={"column"} spacing={2}>
                                    <Grid item container flexDirection={"column"} spacing={1}>
                                        <Grid item>
                                            <CryptoEngineViewer engine={engine} simple />
                                        </Grid>
                                        <Grid item container spacing={1}>
                                            <Grid item xs={4}>
                                                <KeyValueLabel label="Engine ID" value={engine.id} />
                                            </Grid>
                                            <Grid item xs={3}>
                                                <KeyValueLabel label="Type" value={engine.type} />
                                            </Grid>
                                            <Grid item xs={3}>
                                                <KeyValueLabel label="Security Level" value={
                                                    <Box sx={{ width: "fit-content" }}>
                                                        {slLabel}
                                                    </Box>
                                                } />
                                            </Grid>
                                            <Grid item xs>
                                                <KeyValueLabel label="Default Engine" value={
                                                    engine.default
                                                        ? (
                                                            <Box sx={{
                                                                width: "30px",
                                                                height: "30px",
                                                                borderRadius: "100%",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                background: engine.default ? pSBC(0.5, theme.palette.info.light) : ""
                                                            }}>
                                                                <CheckIcon sx={{ color: theme.palette.info.light, fontSize: "12px" }} />
                                                            </Box>
                                                        )
                                                        : (
                                                            <CloseIcon sx={{ color: theme.palette.grey[500] }} />
                                                        )
                                                } />
                                            </Grid>
                                            <Grid item xs={4}>
                                                <KeyValueLabel label="Provider" value={engine.provider} />
                                            </Grid>
                                            <Grid item xs={4}>
                                                <KeyValueLabel label="Name" value={engine.name} />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid item container flexDirection={"column"}>
                                        <Grid item>
                                            <SubsectionTitle>Supported Keys</SubsectionTitle>
                                        </Grid>
                                        <Grid item container spacing={"50px"}>
                                            {
                                                engine.supported_key_types.map((sKtype, idx) => (
                                                    <Grid item key={idx} xs={"auto"}>
                                                        <KeyValueLabel label={sKtype.type} value={sKtype.sizes.join(", ")} />
                                                    </Grid>
                                                ))
                                            }
                                        </Grid>
                                    </Grid>
                                    <Grid item container flexDirection={"column"}>
                                        <Grid item>
                                            <SubsectionTitle>Metadata</SubsectionTitle>
                                        </Grid>
                                        <Grid item>
                                            <MultiKeyValueInput value={engine.metadata} label="" disable={true} />
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </DialogContent>
                            <DialogActions>
                                <Grid container>
                                    <Grid item xs>
                                        <Button onClick={(ev) => { ev.stopPropagation(); ev.preventDefault(); setShowMeta(false); }}>Close</Button>
                                    </Grid>
                                </Grid>
                            </DialogActions>
                        </Dialog>
                    </>
                )
            }
        </Grid >
    );
};
