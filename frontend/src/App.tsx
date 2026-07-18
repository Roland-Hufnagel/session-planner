import './App.css'
import {useEffect, useState} from "react";
import axios from "axios";

type User = {
    id: string,
    name: string,
    nickname: string,
    role: string,
    githubName: string,
    email: string,
    avatarUrl?: string
}

function App() {

    const [users, setUsers] = useState<User[]>([]);
    useEffect(() => {
        axios.get("/api/users").then(res => setUsers(res.data)).catch(e => console.error(e.message))
    }, []);
    return (
        <>
            <h1>Users:</h1>
            {users.map(user => <p key={user.id}>{user.name}</p>)}
        </>

    )
}

export default App
