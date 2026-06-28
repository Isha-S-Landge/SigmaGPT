import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect } from "react";
import { ScaleLoader } from "react-spinners";

function ChatWindow() {
    const { prompt, setPrompt, reply, setReply, currThreadId, setPrevChats,
        setNewChat, setAllThreads, theme, toggleTheme, token, handleLogout,
        loading, setLoading } = useContext(MyContext);
    const [isOpen, setIsOpen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [clearStatus, setClearStatus] = useState("");
    const [isListening, setIsListening] = useState(false);

    const getReply = async () => {
        setLoading(true);
        setNewChat(false);

        try {
            const response = await fetch("https://sigmagpt-backend-hcsq.onrender.com/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: prompt,
                    threadId: currThreadId
                })
            });
            const res = await response.json();
            console.log(res);
            setReply(res.reply);
        } catch (err) {
            console.log(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (prompt && reply) {
            setPrevChats(prevChats => (
                [...prevChats, {
                    role: "user",
                    content: prompt
                }, {
                    role: "assistant",
                    content: reply
                }]
            ));
        }
        setPrompt("");
    }, [reply]);

    const handleProfileClick = () => {
        setIsOpen(!isOpen);
    };

    const handleSettingsClick = () => {
        setIsOpen(false);
        setShowSettings(true);
        setClearStatus("");
    };

    const clearAllChats = async () => {
        try {
            const response = await fetch("https://sigmagpt-backend-hcsq.onrender.com/api/threads", {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const res = await response.json();
            console.log(res);
            setAllThreads([]);
            setPrevChats([]);
            setNewChat(true);
            setClearStatus("✅ All chats cleared successfully!");
        } catch (err) {
            console.log(err);
            setClearStatus("❌ Failed to clear chats.");
        }
    };

    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Your browser does not support voice input. Please use Chrome.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.interimResults = true;
        recognition.continuous = true;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);

        recognition.onresult = (e) => {
            const transcript = Array.from(e.results)
                .map(result => result[0].transcript)
                .join("");
            setPrompt(transcript);
        };

        recognition.onerror = (e) => {
            console.log("Speech error:", e.error);
            setIsListening(false);
        };

        recognition.start();
        window.recognition = recognition;
    };

    const stopListening = () => {
        if (window.recognition) {
            window.recognition.stop();
            setIsListening(false);
        }
    };

    return (
        <div className="chatWindow">
            <div className="navbar">
                <span>SigmaGPT <i className="fa-solid fa-chevron-down"></i></span>
                <div className="navbarRight">
                    <div className="themeToggle" onClick={toggleTheme}>
                        <i className="fa-solid fa-circle-half-stroke"></i>
                    </div>
                    <div className="userIconDiv" onClick={handleProfileClick}>
                        <span className="userIcon"><i className="fa-solid fa-user"></i></span>
                    </div>
                </div>
            </div>

            {isOpen &&
                <div className="dropDown">
                    <div className="dropDownItem" onClick={handleSettingsClick}>
                        <i className="fa-solid fa-gear"></i> Settings
                    </div>
                    <div className="dropDownItem">
                        <i className="fa-solid fa-cloud-arrow-up"></i> Upgrade plan
                    </div>
                    <div className="dropDownItem" onClick={handleLogout}>
                        <i className="fa-solid fa-arrow-right-from-bracket"></i> Log out
                    </div>
                </div>
            }

            {/* Settings Modal */}
            {showSettings &&
                <div className="modalOverlay" onClick={() => setShowSettings(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modalHeader">
                            <h2>Settings</h2>
                            <i className="fa-solid fa-xmark" onClick={() => setShowSettings(false)}></i>
                        </div>

                        <div className="modalSection">
                            <h3><i className="fa-solid fa-trash"></i> Clear All Chats</h3>
                            <p>This will permanently delete all your chat history.</p>
                            {clearStatus && <p className="clearStatus">{clearStatus}</p>}
                            <button className="clearBtn" onClick={clearAllChats}>
                                Clear All Chats
                            </button>
                        </div>

                        <div className="modalSection">
                            <h3><i className="fa-solid fa-circle-info"></i> About</h3>
                            <p>SigmaGPT v1.0</p>
                            <p>Powered by <strong>Groq AI</strong></p>
                            <p>Built with ❤️ by Isha</p>
                        </div>
                    </div>
                </div>
            }

            <Chat />

            <ScaleLoader color="#fff" loading={loading} />

            <div className="chatInput">

                {/* ✅ Recording Bar */}
                {isListening && (
                    <div className="recordingBar">
                        <div className="recordingWave">
                            <div className="wave"></div>
                            <div className="wave"></div>
                            <div className="wave"></div>
                            <div className="wave"></div>
                            <div className="wave"></div>
                        </div>
                        <span>Listening...</span>
                        <button className="stopBtn" onClick={stopListening}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                        <button className="confirmBtn" onClick={stopListening}>
                            <i className="fa-solid fa-check"></i>
                        </button>
                    </div>
                )}

                <div className="inputBox">
                    <input
                        placeholder="Ask anything"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' ? getReply() : ''}
                        disabled={loading}
                    />
                    <div id="mic"
                        onClick={isListening ? stopListening : startListening}
                        style={{ color: isListening ? "#ef4444" : "inherit" }}>
                        <i className={`fa-solid ${isListening ? "fa-stop" : "fa-microphone"}`}></i>
                    </div>
                    <div id="submit" onClick={!loading ? getReply : null}
                        style={{ opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                        <i className="fa-solid fa-paper-plane"></i>
                    </div>
                </div>
                <p className="info">
                    SigmaGPT can make mistakes. Check important info. See Cookie Preferences.
                </p>
            </div>
        </div>
    );
}

export default ChatWindow;