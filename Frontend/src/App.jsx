import './App.css';
import Sidebar from "./Sidebar.jsx";
import ChatWindow from "./ChatWindow.jsx";
import Login from "./Login.jsx";
import { MyContext } from "./MyContext.jsx";
import { useState, useEffect } from 'react';
import { v1 as uuidv1 } from "uuid";

function App() {
    const [prompt, setPrompt] = useState("");
    const [reply, setReply] = useState(null);
    const [currThreadId, setCurrThreadId] = useState(uuidv1());
    const [prevChats, setPrevChats] = useState([]);
    const [newChat, setNewChat] = useState(true);
    const [allThreads, setAllThreads] = useState([]);
    const [loading, setLoading] = useState(false);
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("theme") || "dark";
    });
    const [user, setUser] = useState(() => {
        return localStorage.getItem("name") || null;
    });
    const [token, setToken] = useState(() => {
        return localStorage.getItem("token") || null;
    });

    useEffect(() => {
        localStorage.setItem("theme", theme);
        document.body.setAttribute("data-theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === "dark" ? "light" : "dark");
    };

    const handleLogin = (name) => {
        setUser(name);
        setToken(localStorage.getItem("token"));
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("name");
        setUser(null);
        setToken(null);
        setAllThreads([]);
        setPrevChats([]);
        setNewChat(true);
        setCurrThreadId(uuidv1());
    };

    const providerValues = {
        prompt, setPrompt,
        reply, setReply,
        currThreadId, setCurrThreadId,
        newChat, setNewChat,
        prevChats, setPrevChats,
        allThreads, setAllThreads,
        theme, toggleTheme,
        loading, setLoading,
        user, token,
        handleLogout
    };

    if (!user || !token) {
        return (
            <div data-theme={theme}>
                <Login onLogin={handleLogin} />
            </div>
        );
    }

    return (
        <div className='app'>
            <MyContext.Provider value={providerValues}>
                <Sidebar />
                <ChatWindow />
            </MyContext.Provider>
        </div>
    );
}

export default App;