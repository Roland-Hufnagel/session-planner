import {BrowserRouter, Route, Routes} from "react-router-dom";
import {Layout} from "./components/layout/Layout";
import {LandingPage} from "./pages/LandingPage.tsx";
import {UsersPage} from "./pages/UsersPage";
import {UserDetailPage} from "./pages/UserDetailPage";
import {ProtectedRoute} from "./components/auth/ProtectedRoute.tsx";


function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path={"/"} element={<LandingPage/>}/>
                    <Route element={<ProtectedRoute/>}>
                        <Route path="/users" element={<UsersPage/>}/>
                        <Route path="/users/:id" element={<UserDetailPage/>}/>
                    </Route>

                </Routes>
            </Layout>
        </BrowserRouter>
    );
}

export default App;
