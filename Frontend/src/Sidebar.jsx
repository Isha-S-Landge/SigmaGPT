import "./Sidebar.css";
import { useContext, useEffect, useState } from "react";
import { MyContext } from "./MyContext.jsx";
import { v1 as uuidv1 } from "uuid";

function Sidebar() {
    const { allThreads, setAllThreads, currThreadId, setNewChat, setPrompt,
        setReply, setCurrThreadId, setPrevChats, token } = useContext(MyContext);
    const [editingId, setEditingId] = useState(null); // ✅ track which thread is being edited
    const [editingTitle, setEditingTitle] = useState(""); // ✅ track new title

    const getAllThreads = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/threads", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const res = await response.json();
            const filteredData = res.map(thread => ({
                threadId: thread.threadId,
                title: thread.title
            }));
            setAllThreads(filteredData);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        getAllThreads();
    }, [currThreadId]);

    const createNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv1());
        setPrevChats([]);
    };

    const changeThread = async (newThreadId) => {
        setCurrThreadId(newThreadId);
        try {
            const response = await fetch(`http://localhost:8080/api/threads/${newThreadId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const res = await response.json();
            console.log(res);
            setPrevChats(res);
            setNewChat(false);
            setReply(null);
        } catch (err) {
            console.log(err);
        }
    };

    const deleteThread = async (threadId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/threads/${threadId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const res = await response.json();
            console.log(res);
            setAllThreads(prev => prev.filter(thread => thread.threadId !== threadId));
            if (threadId === currThreadId) {
                createNewChat();
            }
        } catch (err) {
            console.log(err);
        }
    };

    // ✅ Start editing on double click
    const handleDoubleClick = (thread) => {
        setEditingId(thread.threadId);
        setEditingTitle(thread.title);
    };

    // ✅ Save new title
    const saveTitle = async (threadId) => {
        if (!editingTitle.trim()) {
            setEditingId(null);
            return;
        }
        try {
            const response = await fetch(`http://localhost:8080/api/threads/${threadId}/rename`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ title: editingTitle })
            });
            const res = await response.json();
            console.log(res);
            setAllThreads(prev => prev.map(thread =>
                thread.threadId === threadId
                    ? { ...thread, title: editingTitle }
                    : thread
            ));
        } catch (err) {
            console.log(err);
        }
        setEditingId(null);
    };

    return (
        <section className="sidebar">
            <button onClick={createNewChat}>
                <img src="src/assets/blacklogo.png" alt="gpt logo" className="logo" />
                <span><i className="fa-solid fa-pen-to-square"></i></span>
            </button>

            <ul className="history">
                {
                    allThreads?.map((thread, idx) => (
                        <li key={idx}
                            onClick={() => editingId !== thread.threadId && changeThread(thread.threadId)}
                            onDoubleClick={() => handleDoubleClick(thread)}
                            className={thread.threadId === currThreadId ? "highlighted" : " "}
                        >
                            {/* ✅ Show input when editing, text otherwise */}
                            {editingId === thread.threadId ? (
                                <input
                                    className="renameInput"
                                    value={editingTitle}
                                    onChange={(e) => setEditingTitle(e.target.value)}
                                    onBlur={() => saveTitle(thread.threadId)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") saveTitle(thread.threadId);
                                        if (e.key === "Escape") setEditingId(null);
                                    }}
                                    autoFocus
                                    onClick={(e) => e.stopPropagation()}
                                />
                            ) : (
                                thread.title
                            )}
                            <i className="fa-solid fa-trash"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteThread(thread.threadId);
                                }}
                            ></i>
                        </li>
                    ))
                }
            </ul>

            <div className="sign">
                <p>By Isha &hearts;</p>
            </div>
        </section>
    );
}

export default Sidebar;