import { createTheme } from "@mui/material/styles";

const componentsTheme = (theme: CustomTheme) => {
    return {
        // Name of the component
        MuiTextField: {
            defaultProps: {
                // The props to change the default for.
                variant: "filled" // No more ripple, on the whole application 💣!
            }
        },
        MuiFilledInput: {
            defaultProps: {
                // The props to change the default for.
                disableUnderline: true,
                fullWidth: true
            },
            styleOverrides: {
                root: {
                    borderRadius: "5px",
                    fontSize: "14px"
                },
                input: {
                    padding: "10px"
                },
                multiline: {
                    padding: "5px 5px 5px 5px"
                }
            }
        },
        MuiDivider: {
            styleOverrides: {
                root: {
                    background: theme.palette.divider
                }
            }
        }
    };
};

export const light: any = {
    palette: {
        mode: "light",
        tonalOffset: 0.8,
        contrastThreshold: 4.5,
        primary: {
            main: "#0068D1"
        },
        secondary: {
            main: "#00E0FC"
        },
        gray: {
            main: "#EFF0F2"
        },
        scrollbar: {
            thumb: "#555555",
            track: "#EEEEEE"
        },
        divider: "#EFF0F2",
        text: {
            primary: "#333",
            primaryLight: "#5C5F68",
            secondary: "#999eaa"
        },
        background: {
            paper: "#fff",
            default: "#fff",
            lightContrast: "#eff0f2", // f1f1f1
            darkContrast: "#D4D4D4"
        },
        appbar: "#0068D1",
        chartsColors: {
            blue: "#08C2D4",
            green: "#5CA36B",
            yellow: "#F3A83B",
            red: "#da565f",
            purple: "#8F56FE",
            gray: "#ddd",
            background: "#eee",
            text: "#111"
        },
        textField: {
            label: "#6f6f6f",
            background: "#efefef"
        },
        homeCharts: {
            mainCard: {
                primary: "#3F66FE",
                secondary: "#5878FF",
                text: "#fff"
            },
            deviceStatusCard: {
                text: "#eee",
                textSecondary: "#fff",
                primary: "#2441B1"
            },
            issuedCertsPerCA: {
                primary: "#12508f",
                text: "#fff"
            },
            enrolledDevicesPerDMS: {
                primary: "#12508f",
                text: "#fff"
            }
        }
    }
} as const;

export const dark: any = {
    palette: {
        mode: "dark",
        primary: {
            light: "#184d60", // 184d60    4a6952
            main: "#2099C6", // 2099C6    25ee32
            dark: "#104c63" // 104c63   2F6140
        },
        secondary: {
            light: "#222",
            main: "#2099C6",
            dark: "#333"
        },
        success: {
            light: "#576657",
            main: "#25ee32",
            dark: "#2F6140"
        },
        warning: {
            light: "#635d55",
            main: "#F3A83B",
            dark: "#907057"
        },
        error: {
            light: "#6d504e",
            main: "#da565f",
            dark: "#8C3239"
        },
        blue: {
            light: "#184d60", // 184d60    4a6952
            main: "#63B2F6", // 2099C6    25ee32
            dark: "#104c63" // 104c63   2F6140
        },
        gray: {
            light: "#666",
            main: "#555555",
            dark: "#9FA0A1"
        },
        scrollbar: {
            thumb: "#EEEEEE",
            track: "#555555"
        },
        divider: "#29414e",
        text: {
            primary: "#adbbc4",
            primaryLight: "#fff",
            secondary: "#e9ecef"
        },
        background: {
            paper: "#1b2a32",
            default: "#1b2a32",
            lightContrast: "#22343c",
            darkContrast: "#17242b"
        },
        appbar: "#0f171c",
        chartsColors: {
            blue: "#08C2D4",
            green: "#5CA36B",
            yellow: "#F3A83B",
            red: "#da565f",
            purple: "#8F56FE",
            gray: "#ddd",
            background: "#22343C",
            text: "#fff"
        },
        textField: {
            label: "#6f6f6f",
            background: "#efefef"
        },
        homeCharts: {
            mainCard: {
                primary: "#1B2A32",
                secondary: "#2E4856",
                text: "#fff"
            },
            deviceStatusCard: {
                text: "#fff",
                textSecondary: "#ddd",
                primary: "#142024"
            },
            issuedCertsPerCA: {
                primary: "#142024",
                text: "#eee"
            },
            enrolledDevicesPerDMS: {
                primary: "#142024",
                text: "#eee"
            }
        }
    }
} as const;

type CustomTheme = {
    [Key in keyof typeof light]: typeof light[Key]
}
type CustomPalette = {
    [Key in keyof typeof light.palette]: typeof light.palette[Key]
}
type CustomTypeBackground = {
    [Key in keyof typeof light.palette.background]: typeof light.palette.background[Key]
}
type CustomTypeText = {
    [Key in keyof typeof light.palette.text]: typeof light.palette.text[Key]
}
declare module "@mui/material/styles" {
    interface Palette extends CustomPalette { }
    interface Theme extends CustomTheme { }
    interface ThemeOptions extends CustomTheme { }
}
declare module "@mui/material/styles/createPalette" {
    interface TypeBackground extends CustomTypeBackground { }
    interface TypeText extends CustomTypeText { }
}

export const createLightTheme = () => createTheme({ ...light, components: componentsTheme(light) });
export const createDarkTheme = () => createTheme({ ...dark, components: componentsTheme(dark) });
