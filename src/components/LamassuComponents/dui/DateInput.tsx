import React from "react";
import { DatePicker, LocalizationProvider } from "@mui/lab";
import DateAdapter from "@mui/lab/AdapterMoment";
import moment from "moment";
import { TextField } from "@mui/material";
import { KeyValueLabel } from "./KeyValueLabel";

export interface DateInputProps {
    value: moment.Moment
    onChange: (ev: moment.Moment) => void,
    label: string
}

const DateInput: React.FC<DateInputProps> = ({ value, onChange, label, ...props }) => {
    return (
        <KeyValueLabel
            label={label}
            value={
                <LocalizationProvider dateAdapter={DateAdapter}>
                    <DatePicker
                        label=""
                        value={value}
                        onChange={(ev) => {
                            if (ev) {
                                onChange(ev);
                            }
                        }}
                        renderInput={(params: any) => <TextField fullWidth {...params} />}
                    />
                </LocalizationProvider>
            }
        />
    );
};

export default DateInput;
