import { Box, Grid, useTheme } from "@mui/material";
import React, { useRef, useState } from "react";

import Editor from "@monaco-editor/react";
import { Label } from "@fluentui/react-label";
import { Input } from "@fluentui/react-input";

export const PermissionsView = () => {
    const theme = useTheme();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [code, setCode] = useState(`package lamassu.gateway.security

import input.attributes.request.http as http_request

default allow = false

allow  {
    action_allowed
}

action_allowed {
    startswith(http_request.path, "/api/devmanager/.well-known/")
}

action_allowed {
    startswith(http_request.path, "/api/dmsmanager/.well-known/")
}
action_allowed {
    allowed_methods := ["OPTIONS"]
    allowed_methods[_] == http_request.method 
}

action_allowed {
    token.payload["realm_access"]["roles"][_] == "pki-admin"
}

action_allowed {
    allowed_methods := ["GET", "POST"]
    allowed_methods[_] == http_request.method 
    startswith(http_request.path, "/api/dmsmanager/")
    token.payload["realm_access"]["roles"][_] == "operator"
}

token := {"payload": payload} {
    [_, encoded] := split(http_request.headers.authorization, " ")
    [header, payload, sig] := io.jwt.decode(encoded) 
}
   `);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <Grid sx={{ overflowY: "auto", flexGrow: 1, height: "300px" }} >
                <Box style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <Box style={{ padding: "40px" }}>
                        <Grid container flexDirection={"column"} spacing={2}>
                            <Grid item>
                                <Label>Policy</Label>
                                <Input style={{ width: "100%" }} value="lab.lamassu.io" />
                            </Grid>
                            <Grid item>
                                <Editor
                                    theme="vs-dark"
                                    defaultValue={code}
                                    onChange={code => setCode(code!)}
                                    height="550px" />
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Grid>
        </Box>
    );
};
