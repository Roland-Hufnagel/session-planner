import {BrowserRouter, Route, Routes} from "react-router-dom";
import {Layout} from "./components/layout/Layout";
import {LandingPage} from "./pages/LandingPage.tsx";
import {UsersPage} from "./pages/UsersPage";
import {UserDetailPage} from "./pages/UserDetailPage";
import {CohortsPage} from "./pages/CohortsPage";
import {CohortDetailPage} from "./pages/CohortDetailPage";
import {ShiftsPage} from "./pages/ShiftsPage";
import {SchedulePage} from "./pages/SchedulePage";
import {ProtectedRoute} from "./components/auth/ProtectedRoute.tsx";
import {NotFoundPage} from "./pages/NotFoundPage";


function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path={"/"} element={<LandingPage/>}/>
                    <Route element={<ProtectedRoute/>}>
                        <Route path="/users" element={<UsersPage/>}/>
                        <Route path="/users/:id" element={<UserDetailPage/>}/>
                        <Route path="/cohorts" element={<CohortsPage/>}/>
                        <Route path="/cohorts/:id" element={<CohortDetailPage/>}/>
                        <Route path="/schedule" element={<SchedulePage/>}/>
                        <Route path="/shifts" element={<ShiftsPage/>}/>
                    </Route>
                    <Route path="*" element={<NotFoundPage/>}/>
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}

export default App;
