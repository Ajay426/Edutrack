import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Login.css";

function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {

        try {

            const response = await api.post("/auth/login", {
                email,
                password,
            });

            if (response.data.success) {

                const user = response.data.user;

                localStorage.setItem("user", JSON.stringify(user));

                if (user.role === "ADMIN") {
                    navigate("/admin/dashboard");
                } else if (user.role === "FACULTY") {
                    navigate("/faculty/dashboard");
                }

            }

        } catch (err) {

           console.log(err);

console.log(err.response);

console.log(err.response?.data);

alert(err.response?.data?.message || err.message);

        }

    };

    return (
        <div className="login-page">

            <div className="bubble-container">
                <div className="bubble bubble-1"></div>
                <div className="bubble bubble-2"></div>
                <div className="bubble bubble-3"></div>
                <div className="bubble bubble-4"></div>
                <div className="bubble bubble-5"></div>
            </div>

            <div className="login-container">

                <div className="login-header">

                    <div className="logo">
                        🎓
                    </div>

                    <h1>Student Attendance Management System</h1>

                    <p>Manage attendance efficiently and securely</p>

                </div>

                <div className="login-card">

                    <h2>Welcome Back</h2>

                    <p>Sign in to continue</p>

                    <div className="form-group">

                        <label>Email</label>

                        <input
                            type="email"
                            placeholder="Enter Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                    </div>

                    <div className="form-group">

                        <label>Password</label>

                        <input
                            type="password"
                            placeholder="Enter Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                    </div>

                    <button
                        className="login-btn"
                        onClick={handleLogin}
                    >
                        Login
                    </button>

                </div>

            </div>

        </div>
    );
}

export default Login;