import React from "react";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import { KeyValueLabel } from "./KeyValueLabel";
import "moment/locale/es";

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
                <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="es">
                    <DatePicker
                        label=""
                        value={value}
                        slotProps={{ textField: { fullWidth: true } }}
                        onChange={(ev) => {
                            if (ev) {
                                onChange(ev);
                            }
                        }}
                    />
                </LocalizationProvider>
            }
        />
    );
};

export default DateInput;
