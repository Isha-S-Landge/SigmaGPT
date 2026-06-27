import "./Chat.css";
import React, { useContext, useState, useEffect, useRef } from "react";
import { MyContext } from "./MyContext";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

function Chat() {
    const { newChat, prevChats, reply, loading, user } = useContext(MyContext);
    const [latestReply, setLatestReply] = useState(null);
    const [copiedIdx, setCopiedIdx] = useState(null);
    const bottomRef = useRef(null);

    // ✅ Auto scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [prevChats, latestReply, loading]);

    useEffect(() => {
        if (reply === null) {
            setLatestReply(null);
            return;
        }

        if (!prevChats?.length) return;

        const content = reply.split(" ");

        let idx = 0;
        const interval = setInterval(() => {
            setLatestReply(content.slice(0, idx + 1).join(" "));
            idx++;
            if (idx >= content.length) clearInterval(interval);
        }, 40);

        return () => clearInterval(interval);

    }, [prevChats, reply]);

    const copyToClipboard = (text, idx) => {
        navigator.clipboard.writeText(text);
        setCopiedIdx(idx);
        setTimeout(() => setCopiedIdx(null), 2000);
    };

    // ✅ Time based greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return "Good Morning";
        if (hour >= 12 && hour < 17) return "Good Afternoon";
        if (hour >= 17 && hour < 21) return "Good Evening";
        return "Good Night";
    };

    return (
        <>
            {/* ✅ Time based greeting */}
            {newChat && (
                <div className="greetingDiv">
                    <h1>{getGreeting()}, {user}!</h1>
                    <p>How can I help you today?</p>
                </div>
            )}

            <div className="chats">
                {
                    prevChats?.slice(0, reply ? -1 : undefined).map((chat, idx) =>
                        <div className={chat.role === "user" ? "userDiv" : "gptDiv"} key={idx}>
                            {
                                chat.role === "user" ?
                                <p className="userMessage">{chat.content}</p> :
                                <div className="gptMessage">
                                    <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{chat.content}</ReactMarkdown>
                                    <button className="copyBtn" onClick={() => copyToClipboard(chat.content, idx)}>
                                        {copiedIdx === idx
                                            ? <><i className="fa-solid fa-check"></i> Copied!</>
                                            : <><i className="fa-regular fa-copy"></i> Copy</>
                                        }
                                    </button>
                                </div>
                            }
                        </div>
                    )
                }

                {
                    prevChats.length > 0 && (
                        <>
                            {
                                latestReply === null ? (
                                    <div className="gptDiv" key="non-typing">
                                        <div className="gptMessage">
                                            <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{prevChats[prevChats.length - 1].content}</ReactMarkdown>
                                            <button className="copyBtn" onClick={() => copyToClipboard(prevChats[prevChats.length - 1].content, -1)}>
                                                {copiedIdx === -1
                                                    ? <><i className="fa-solid fa-check"></i> Copied!</>
                                                    : <><i className="fa-regular fa-copy"></i> Copy</>
                                                }
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="gptDiv" key="typing">
                                        <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{latestReply}</ReactMarkdown>
                                    </div>
                                )
                            }
                        </>
                    )
                }

                {/* ✅ Typing Indicator */}
                {loading && (
                    <div className="typingIndicator">
                        <span>SigmaGPT is thinking</span>
                        <div className="dots">
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                        </div>
                    </div>
                )}

                <div ref={bottomRef}></div>
            </div>
        </>
    );
}

export default Chat;