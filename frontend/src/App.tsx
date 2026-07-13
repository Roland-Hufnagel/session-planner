import './App.css'
import {useEffect, useState} from "react";
import axios from "axios";

function App() {

    const [name, setName] = useState("");
    useEffect(() => {
        axios.get("/api").then(res => setName(res.data)).catch(e => setName(e.message))
    }, []);
    return (
        <h1>
            Welcome to <b>{name}</b>
        </h1>
    )
}

export default App
