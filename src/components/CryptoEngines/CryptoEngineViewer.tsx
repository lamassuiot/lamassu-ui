import { Box, Button, Dialog, DialogActions, DialogContent, IconButton, Paper, Typography, darken, lighten, useTheme } from "@mui/material";
import { CryptoEngine } from "ducks/features/cas/models";
import { IoFolderOpen } from "react-icons/io5";
import { KeyValueLabel } from "components/KeyValue";
import { MetadataInput } from "components/forms/MetadataInput";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import Label from "components/Label";
import React, { useState } from "react";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";

export const EnginesIcons = [
    {
        uniqueID: "AWS_SECRETS_MANAGER",
        icon: (
            <img src={process.env.PUBLIC_URL + "/assets/AWS-SM.png"} height={"100%"} width={"100%"} />
        )
    },
    {
        uniqueID: "AWS_KMS",
        icon: (
            <img src={process.env.PUBLIC_URL + "/assets/AWS-KMS.png"} height={"100%"} width={"100%"} />
        )
    },
    {
        uniqueID: "HASHICORP_VAULT_KV_V2",
        icon: (
            <img src={process.env.PUBLIC_URL + "/assets/HASHICORP-VAULT.png"} height={"100%"} width={"100%"} />
        )
    },
    {
        uniqueID: "PKCS11",
        icon: (
            <img src={process.env.PUBLIC_URL + "/assets/PKCS11.png"} height={"100%"} width={"100%"} />
        )
    },
    {
        uniqueID: "GOLANG",
        icon: (
            <Grid container alignItems={"center"} justifyContent={"center"} height={"100%"} width={"100%"} sx={{ background: "#333333" }} >
                <Grid xs={"auto"}>
                    <IoFolderOpen color="white" />
                </Grid>
            </Grid>
        )
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
        slLabel = <Typography sx={{ padding: "3px 5px", borderRadius: "2px", background: lighten(theme.palette.error.light, 0.5), color: darken(theme.palette.error.main, 0.5) }}>Low (0)</Typography>;
        break;
    case 1:
        slLabel = <Typography sx={{ padding: "3px 5px", borderRadius: "2px", background: lighten(theme.palette.warning.light, 0.5), color: darken(theme.palette.warning.main, 0.5) }}>Medium (1)</Typography>;
        break;
    case 2:
        slLabel = <Typography sx={{ padding: "3px 5px", borderRadius: "2px", background: lighten(theme.palette.success.light, 0.5), color: darken(theme.palette.success.main, 0.5) }}>High (2)</Typography>;
        break;

    default:
        slLabel = <Typography sx={{ padding: "3px", background: lighten(theme.palette.grey[300], 0.01) }}>Unknown</Typography>;
        break;
    }

    return (
        <Grid container spacing={2} alignItems={"center"} sx={{ ...style }}>
            <Grid xs={"auto"}>
                <Box component={Paper} sx={{ height: "40px", width: "40px" }}>
                    {
                        EnginesIcons.find((e) => e.uniqueID === engine.type)?.icon
                    }
                </Box>
            </Grid>
            {
                !simple && (
                    <>
                        <Grid xs={"auto"}>
                            <Typography fontWeight={"500"} fontSize={"14px"}>{engine.provider}</Typography>
                            <Typography fontWeight={"400"} fontSize={"14px"}>{engine.name}</Typography>
                        </Grid>
                        {
                            engine.default && (
                                <>
                                    <Grid xs={"auto"}>
                                        <Typography>|</Typography>
                                    </Grid>
                                    <Grid xs={"auto"}>
                                        <Label color={[theme.palette.primary.main, lighten(theme.palette.primary.main, 0.8)]}>DEFAULT ENGINE</Label>
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
                        <Grid xs container justifyContent={"flex-end"}>
                            <IconButton onClick={(ev) => { ev.stopPropagation(); ev.preventDefault(); setShowMeta(true); }}>
                                <RemoveRedEyeIcon />
                            </IconButton>
                        </Grid>
                        <Dialog open={showMeta} onClose={(ev: any) => {
                            ev.stopPropagation(); setShowMeta(false);
                        }} fullWidth maxWidth={"lg"}>
                            <DialogContent onClick={(ev: any) => { ev.stopPropagation(); }} >
                                <Grid container flexDirection={"column"} spacing={2}>
                                    <Grid container flexDirection={"column"} spacing={1}>
                                        <Grid>
                                            <CryptoEngineViewer engine={engine} simple />
                                        </Grid>
                                        <Grid container spacing={1}>
                                            <Grid xs={4}>
                                                <KeyValueLabel label="Engine ID" value={engine.id} />
                                            </Grid>
                                            <Grid xs={3}>
                                                <KeyValueLabel label="Type" value={engine.type} />
                                            </Grid>
                                            <Grid xs={3}>
                                                <KeyValueLabel label="Security Level" value={
                                                    <Box sx={{ width: "fit-content" }}>
                                                        {slLabel}
                                                    </Box>
                                                } />
                                            </Grid>
                                            <Grid xs>
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
                                                                background: engine.default ? lighten(theme.palette.info.light, 0.5) : ""
                                                            }}>
                                                                <CheckIcon sx={{ color: theme.palette.info.light, fontSize: "12px" }} />
                                                            </Box>
                                                        )
                                                        : (
                                                            <CloseIcon sx={{ color: theme.palette.grey[500] }} />
                                                        )
                                                } />
                                            </Grid>
                                            <Grid xs={4}>
                                                <KeyValueLabel label="Provider" value={engine.provider} />
                                            </Grid>
                                            <Grid xs={4}>
                                                <KeyValueLabel label="Name" value={engine.name} />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid container flexDirection={"column"}>
                                        <Grid>
                                            <Typography>Supported Keys</Typography>
                                        </Grid>
                                        <Grid container spacing={"50px"}>
                                            {
                                                engine.supported_key_types.map((sKtype, idx) => (
                                                    <Grid key={idx} xs={"auto"}>
                                                        <KeyValueLabel label={sKtype.type} value={sKtype.sizes.join(", ")} />
                                                    </Grid>
                                                ))
                                            }
                                        </Grid>
                                    </Grid>
                                    <Grid container flexDirection={"column"}>
                                        <Grid>
                                            <Typography>Metadata</Typography>
                                        </Grid>
                                        <Grid>
                                            <MetadataInput value={engine.metadata} label="" disabled={true} onChange={(ev) => {}}/>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </DialogContent>
                            <DialogActions>
                                <Grid container>
                                    <Grid xs>
                                        <Button onClick={(ev) => { ev.stopPropagation(); ev.preventDefault(); setShowMeta(false); }}>Close</Button>
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
