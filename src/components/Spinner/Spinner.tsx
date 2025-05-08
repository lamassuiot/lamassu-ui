import { Box } from "@mui/material";
import BeatLoader from "react-spinners/BeatLoader";
import { useLoading } from "./LoadingContext";

const Spinner = () => {
    const { loading } = useLoading();

    return (loading
        ? (
            <Box
                sx={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    zIndex: 1300
                }}
            >
                <BeatLoader
                    color="#1060ff"
                    loading = {true}
                    size={16}
                />
            </Box>)
        : null
    );
};

export default Spinner;
