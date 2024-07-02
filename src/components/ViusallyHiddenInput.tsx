import { styled } from "@mui/material";
import React, { ReactElement, Ref } from "react";

const HiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1
});

interface Props {
    onChange: (content: string) => void
    ref?: Ref<HTMLInputElement>
}

const HiddenInputHandler = (props: Props, ref: Ref<HTMLInputElement>) => {
    function handleFileUpload (event: any) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = function (loadEv) {
            // The file's text will be printed here
            // console.log("file content", event.target.result)
            if (loadEv.target !== null && loadEv.target.result !== null) {
                const code = loadEv.target.result.toString();
                props.onChange(code);
            }
        };

        reader.readAsText(file);
    }

    // setting value to "" makes so that if the same file is selected, the onchange func is triggered
    return <HiddenInput ref={ref} type="file" value={""} onChange={(ev) => handleFileUpload(ev)} />;
};

export const VisuallyHiddenInput = React.forwardRef(HiddenInputHandler) as (props: Props & { ref?: Ref<HTMLInputElement> }) => ReactElement;
