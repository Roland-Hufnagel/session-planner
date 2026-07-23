import {BrowserRouter, Route, Routes} from "react-router-dom";
import {Layout} from "./components/layout/Layout";
import {LandingPage} from "./pages/LandingPage.tsx";
import {UsersPage} from "./pages/UsersPage";
import {UserDetailPage} from "./pages/UserDetailPage";


function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path={"/"} element={<LandingPage/>}/>
                    <Route path="/users" element={<UsersPage/>}/>
                    <Route path="/users/:id" element={<UserDetailPage/>}/>
                    {/*<Route path="*" element={<Navigate to="/users" replace/>}/>*/}
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}

export default App;
