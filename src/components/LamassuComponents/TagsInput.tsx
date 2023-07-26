import Downshift from "downshift";
import React from "react";
import { TextField } from "./dui/TextField";
import { Chip } from "@mui/material";

interface TagProps {
    placeholder: string;
    label: string;
    tags: string[];
    onChange: (tags: string[]) => void;
}

type Item = string

const TagsInput: React.FC<TagProps> = ({ placeholder = "", tags, label, onChange, ...other }) => {
    const [inputValue, setInputValue] = React.useState("");

    const handleKeyDown = (event: any) => {
        if (event.key === "Enter") {
            event.preventDefault();
            event.stopPropagation();
            const newSelectedItem = [...tags];
            const duplicatedValues = newSelectedItem.indexOf(
                // @ts-ignore
                event.target.value.trim()
            );

            if (duplicatedValues !== -1) {
                setInputValue("");
                return;
            }

            // @ts-ignore
            if (event.target.value.length === 0) return;

            // @ts-ignore
            newSelectedItem.push(event.target.value.trim());
            onChange(newSelectedItem);
            setInputValue("");
        }

        if (
            tags.length &&
            !inputValue.length &&
            event.key === "Backspace"
        ) {
            onChange(tags.slice(0, tags.length - 1));
        }
    };

    const handleChange = (item: Item | null) => {
        if (item !== null) {
            let newSelectedItem = [...tags];
            if (newSelectedItem.indexOf(item) === -1) {
                newSelectedItem = [...newSelectedItem, item];
            }
            setInputValue("");
            onChange(newSelectedItem);
        }
    };

    const handleDelete = (item: any) => {
        const newSelectedItem = [...tags];
        newSelectedItem.splice(newSelectedItem.indexOf(item), 1);
        onChange(newSelectedItem);
    };

    const handleInputChange = (event: any) => {
        setInputValue(event.target.value);
    };

    return (
        <Downshift
            inputValue={inputValue}
            onChange={handleChange}
        >
            {({ getInputProps }) => {
                const { onBlur, onChange, onFocus, ...inputProps } = getInputProps({
                    onKeyDown: handleKeyDown,
                    placeholder
                });
                return (
                    <div style={{ width: "100%" }}>
                        <TextField
                            fullWidth
                            label={label}
                            value={inputValue}
                            onChange={(event) => {
                                handleInputChange(event);
                            }}
                            inputProps={{ style: { width: "auto" } }}
                            onFocus={onFocus}
                            onBlur={onBlur}
                            onKeyDown={handleKeyDown}
                            startAdornment={
                                tags.map(item => (
                                    <Chip
                                        key={item}
                                        tabIndex={-1}
                                        label={item}
                                        sx={{ margin: "7px 3px", borderRadius: "5px" }}
                                        size="small"
                                        onDelete={(ev) => handleDelete(item)}
                                    />
                                ))
                            }
                            sx={{ display: "flex", flexWrap: "wrap" }}
                        />
                    </div>
                );
            }}
        </Downshift>
    );
};

export default TagsInput;
