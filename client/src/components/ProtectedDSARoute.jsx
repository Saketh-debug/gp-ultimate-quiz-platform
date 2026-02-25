import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedDSARoute({ children }) {
    const location = useLocation();

    // The user MUST have arrived via the DSA token entry page with session data, or have local token
    if (!location.state?.session && !localStorage.getItem("dsaToken")) {
        return <Navigate to="/dsa" replace />;
    }

    return children;
}
