import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../AuthService.js"; 
import styles from "./Login.module.css";
import logo from "../../Logo/doctor_clean_logo.png";

const Login = ({ setUser }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await loginUser(username, password);
    console.log("Login Result:", result);

    if (result.success) {
      const user = result.user; // Assuming `loginUser` returns the user object
      console.log("User data from API:", user);

      // Clear old session
      localStorage.removeItem("user");

      // Store the user data in local storage, including the teams property
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: user.id,
          username: user.username,
          role: user.role,
          service_assigned: user.service_assigned,
          privilege: user.privilege,
          teams: user.teams, // <-- Add teams here!
        })
      );

      // Update the user state
      setUser({
        id: user.id,
        username: user.username,
        role: user.role,
        service_assigned: user.service_assigned,
        privilege: user.privilege,
        teams: user.teams, // <-- Add teams here!
      });

      navigate("/dashboard", { replace: true });
    } else {
      console.error("Login Error:", result.error);
      setError(result.error);
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        {/* Left Side - Login Form */}
        <div className={styles.left}>
          <p className={styles.detailsText}>Please enter your details</p>
          <h2>Welcome Back</h2>
          {error && <p className={styles.error}>{error}</p>}

          {isLoading ? (
            <div className={styles.preloader}>
              <h2>Logging in...</h2>
              <p>Please wait while we verify your credentials</p>
            </div>
          ) : (
            <form onSubmit={handleLogin} className={styles.loginForm}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className={styles.inputField}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.inputField}
              />
              <div className={styles.forgotPassword}>
                <a href="/forgot-password">Forgot password?</a>
              </div>
              <button type="submit" className={styles.loginButton}>Log In</button>
            </form>
          )}

          <p className={styles.signupText}>
            Don't have an account? <a href="/signup">Sign up</a>
          </p>
        </div>

        {/* Right Side - Logo */}
        <div className={styles.right}>
          <img src={logo} alt="Doctor Clean Logo" className={styles.logo} />
        </div>
      </div>

      {/* Footer */}
      <p className={styles.footerText}>© 2025 Doctor Clean Private Limited.</p>
    </div>
  );
};

export default Login;