import {Navigate, Outlet} from "react-router-dom";
import {useAuth} from "../../hooks/useAuth";

/**
 * Schützt verschachtelte Routen: ausgeloggt → LandingPage.
 * Nur UX – die echte Absicherung macht das Backend (401).
 */
export function ProtectedRoute() {
    const {user, isLoading} = useAuth();

    if (isLoading) return null;                    // Auth-Status noch unbekannt
    if (!user) return <Navigate to="/" replace/>;
    return <Outlet/>;
}