import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userManager } from "auths/oidcConfig";
import { useLoading } from "components/Spinner/LoadingContext";
import { Landing } from "components/Landing/Landing";

const AuthCallback = () => {
    const navigate = useNavigate();
    const { setLoading } = useLoading();

    useEffect(() => {
        setLoading(true);
        const urlParams = new URLSearchParams(window.location.search);
        const hasCode = urlParams.has("code");
        const hasState = urlParams.has("state");

        if (hasCode && hasState) {
            userManager.signinRedirectCallback()
                .then(() => {
                    navigate("/", { replace: true });
                })
                .catch(err => {
                    console.error("Login callback error:", err);
                    navigate("/", { replace: true });
                })
                .finally(() => setLoading(false));
        } else {
            console.warn("No OIDC parameters found in URL.");
            setLoading(false);
            navigate("/", { replace: true });
        };
    }, []);

    return <Landing />;
};

export default AuthCallback;
