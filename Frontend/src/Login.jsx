import { useState } from "react";
import "./Login.css";

function Login({ onLogin }) {
    const [isSignup, setIsSignup] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setError("");
        setLoading(true);

        const url = isSignup
            ? "http://localhost:8080/api/auth/signup"
            : "http://localhost:8080/api/auth/login";

        const body = isSignup
            ? { name, email, password }
            : { email, password };

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            const res = await response.json();

            if (res.error) {
                setError(res.error);
            } else {
                localStorage.setItem("token", res.token);
                localStorage.setItem("name", res.name);
                onLogin(res.name);
            }
        } catch (err) {
            setError("Something went wrong. Try again.");
        }
        setLoading(false);
    };

    return (
        <div className="loginPage">
            <div className="loginBox">
                <img src="src/assets/blacklogo.png" alt="logo" className="loginLogo" />
                <h1>SigmaGPT</h1>
                <p className="loginSubtitle">
                    {isSignup ? "Create your account" : "Welcome back!"}
                </p>

                {isSignup && (
                    <input
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="loginInput"
                    />
                )}

                <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="loginInput"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="loginInput"
                    onKeyDown={(e) => e.key === "Enter" ? handleSubmit() : ""}
                />

                {error && <p className="loginError">{error}</p>}

                <button
                    className="loginBtn"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? "Please wait..." : isSignup ? "Sign Up" : "Log In"}
                </button>

                <p className="loginSwitch">
                    {isSignup ? "Already have an account?" : "Don't have an account?"}
                    <span onClick={() => {
                        setIsSignup(!isSignup);
                        setError("");
                    }}>
                        {isSignup ? " Log In" : " Sign Up"}
                    </span>
                </p>
            </div>
        </div>
    );
}

export default Login;