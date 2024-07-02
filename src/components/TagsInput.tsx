import { Chip } from "@mui/material";
import { TextField } from "./TextField";
import React from "react";

export interface TagProps {
    label: string;
    tags: string[];
    onChange: (tags: string[]) => void;
}

type Item = string

const TagsInput: React.FC<TagProps> = ({ tags, label, onChange, ...other }) => {
    const [inputValue, setInputValue] = React.useState("");

    const handleKeyDown = (event: any) => {
        if (event.key === "Enter") {
            event.preventDefault();
            event.stopPropagation();
            const newSelectedItem = [...tags];
            const duplicatedValues = newSelectedItem.indexOf(
                event.target.value.trim()
            );

            if (duplicatedValues !== -1) {
                setInputValue("");
                return;
            }

            if (event.target.value.length === 0) return;

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

    const handleDelete = (item: any) => {
        const newSelectedItem = [...tags];
        newSelectedItem.splice(newSelectedItem.indexOf(item), 1);
        onChange(newSelectedItem);
    };

    const handleInputChange = (event: any) => {
        setInputValue(event.target.value);
    };

    return (
        <TextField
            fullWidth
            label={label}
            value={inputValue}
            onChange={(event) => {
                handleInputChange(event);
            }}
            inputProps={{ style: { width: "auto" } }}
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
    );
};

export default TagsInput;
