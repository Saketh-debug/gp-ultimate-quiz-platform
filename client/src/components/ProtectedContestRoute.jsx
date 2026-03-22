
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedContestRoute({ children }) {
    const location = useLocation();

    // The user MUST have arrived via the token entry page (which sets location.state.session)
    // If they just typed the URL, location.state is null -> redirect to login
    // Even if localStorage has a token, we force them to re-enter it to start a fresh session approach
    // (unless it's a reload, but reloads don't have location.state either? 
    // WAIT: Reloads DO lose location.state. 
    // If I block traffic without location.state, RELOADS WILL FAIL.

    // Correction:
    // 1. New Join: has location.state.session
    // 2. Reload: has NO location.state, but HAS localStorage token
    // 3. Direct Access (bad): has NO location.state, and MIGHT have stale localStorage token

    // Distinguishing Reload vs Direct Access is hard. 
    // Standard pattern: 
    // - If we have session in state, good.
    // - If not, check localStorage. If token exists, verify it with backend (loading state).
    // - If no token, redirect.

    // BUT the user specific requirement was: "I enter without token... with which token do I access?"
    // This implies they want to FORCE token entry.
    // If I allow localStorage fallback, I re-enable the "bypass" if the token is stale.

    // Solution:
    // We MUST clear localStorage when the "Session" is truly over.
    // And on the 'Login' page, we always clear it.
    // So if a user navigates to /rapidfire, token is gone.
    // If they navigate to /rapidfire-contest directly:
    // - If they have a token, it might be a reload OR a stale one.
    // - If we cleared it on "Contest Over", then a stale token implies they abandoned a previous session?

    // Let's stick to the plan:
    // 1. Rapidfire.jsx (login page) -> Clears token on mount. Use effect.
    // 2. RapidfireContest.jsx -> Clears token on "Game Over" / "Submit All".
    // 3. ProtectedRoute -> Checks if (state.session OR localStorage.token). 
    //    - If neither -> Redirect.
    //    - If localStorage.token exists but no state -> It's a reload (or stale direct access).
    //      - We allow it, assuming "stale direct access" is minimized by step 1 & 2.

    if (!location.state?.session && !localStorage.getItem("userToken")) {
        return <Navigate to="/rapidfire" replace />;
    }

    return children;
}
