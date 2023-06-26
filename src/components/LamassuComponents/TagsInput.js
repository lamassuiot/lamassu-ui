import React, { useEffect } from "react";
import PropTypes from "prop-types";
import Downshift from "downshift";
import { Chip, TextField } from "@mui/material";

export default function TagsInput({ placeholder = "", tags,onChange, ...other }) {
    const [inputValue, setInputValue] = React.useState("");

    function handleKeyDown(event) {
        if (event.key === "Enter") {
            const newSelectedItem = [...tags];
            const duplicatedValues = newSelectedItem.indexOf(
                event.target.value.trim()
            );

            if (duplicatedValues !== -1) {
                setInputValue("");
                return;
            }
            if (!event.target.value.replace(/\s/g, "").length) return;

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
    }
    function handleChange(item) {
        let newSelectedItem = [...tags];
        if (newSelectedItem.indexOf(item) === -1) {
            newSelectedItem = [...newSelectedItem, item];
        }
        setInputValue("");
        onChange(newSelectedItem);
    }

    const handleDelete = item => () => {
        const newSelectedItem = [...tags];
        newSelectedItem.splice(newSelectedItem.indexOf(item), 1);
        onChange(newSelectedItem);
    };

    function handleInputChange(event) {
        setInputValue(event.target.value);
    }

    return (
            <Downshift
                id="downshift-multiple"
                inputValue={inputValue}
                onChange={handleChange}
                tags={tags}
                
            >
                {({ getInputProps }) => {
                    const { onBlur, onChange, onFocus, ...inputProps } = getInputProps({
                        onKeyDown: handleKeyDown,
                        placeholder
                    });
                    return (
                        <div style={{width: "100%"}}>
                            <TextField
                            placeholder="Press enter to add a new tag"
                            fullWidth
                                {...other}
                                InputProps={{
                                    sx: { display: "flex", flexWrap: "wrap" },
                                    startAdornment: tags.map(item => (
                                        <Chip
                                            key={item}
                                            tabIndex={-1}
                                            label={item}
                                            sx={{ margin: "7px 3px" }}
                                            size="small"
                                            onDelete={handleDelete(item)}
                                        />
                                    )),
                                    onBlur,
                                    onChange: event => {
                                        handleInputChange(event);
                                        onChange(event);
                                    },
                                    onFocus
                                }}
                                {...inputProps}
                            />
                        </div>
                    );
                }}
            </Downshift>
    );
}
TagsInput.defaultProps = {
    tags: []
};
TagsInput.propTypes = {
    selectedTags: PropTypes.func.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string)
};
