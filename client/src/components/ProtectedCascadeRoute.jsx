import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedCascadeRoute({ children }) {
    const location = useLocation();

    // The user MUST have arrived via the cascade token entry page
    if (!location.state?.session && !localStorage.getItem("cascadeToken")) {
        return <Navigate to="/cascade" replace />;
    }

    return children;
}
