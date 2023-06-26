import React from "react";
import { Box, Grid, IconButton, Tooltip, useTheme } from "@mui/material";
import { materialLight, materialOceanic } from "react-syntax-highlighter/dist/esm/styles/prism";
import download from "components/utils/FileDownloader";
import SyntaxHighlighter from "react-syntax-highlighter";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";

interface CodeCopierProsBase {
    code: string
    fullWeight?: boolean
    isJSON?: boolean,
    enableCopy?: boolean,
    enableDownload?: boolean,
}

interface CodeCopierProsWithDownload extends CodeCopierProsBase {
    enableDownload: true
    downloadFileName: string
}

type CodeCopierPros = CodeCopierProsBase | CodeCopierProsWithDownload

const CodeCopier: React.FC<CodeCopierPros> = ({ enableCopy = true, ...props }) => {
    const theme = useTheme();

    return (
        <Box sx={{
            padding: "5px 20px",
            borderRadius: "10px",
            height: "fit-content",
            width: props.fullWeight ? "100%" : "fit-content",
            background: theme.palette.mode === "light" ? "#FAFAFA" : "#263238"
        }}>
            <Grid container spacing={"10px"}>
                <Grid item xs>
                    <SyntaxHighlighter
                        wrapLongLines={true}
                        {...(props.isJSON && { language: "json" })}
                        style={theme.palette.mode === "light" ? materialLight : materialOceanic}
                        customStyle={{
                            fontSize: 12,
                            padding: 0,
                            margin: 0
                        }}
                        wrapLines={true}
                        lineProps={{ style: { color: theme.palette.mode === "light" ? "#30444f" : "#ddd", wordBreak: "break-all", whiteSpace: "pre-wrap" } }}
                    >
                        {
                            props.isJSON ? JSON.stringify(JSON.parse(props.code), null, 4) : props.code
                        }
                    </SyntaxHighlighter>
                </Grid>
                <Grid item xs="auto" container direction={"column"} spacing={"5px"}>
                    {
                        enableCopy && (
                            <Grid item>
                                <Tooltip title="Copy to Clipboard">
                                    <IconButton onClick={(ev) => { ev.stopPropagation(); navigator.clipboard.writeText(props.code); }}>
                                        <ContentPasteIcon fontSize={"small"} />
                                    </IconButton>
                                </Tooltip>
                            </Grid>
                        )
                    }
                    {
                        props.enableDownload === true && "downloadFileName" in props && (
                            <Grid item>
                                <Tooltip title="Download File">
                                    <IconButton onClick={(ev) => { download(props.downloadFileName, props.code); }}>
                                        <FileDownloadRoundedIcon fontSize={"small"} />
                                    </IconButton>
                                </Tooltip>
                            </Grid>
                        )
                    }
                </Grid>
            </Grid>
        </Box>

    );
};

export { CodeCopier }; export type { CodeCopierPros };
