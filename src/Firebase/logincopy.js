import { useState, useEffect } from "react";
import { firestore } from "./firebase"; 
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // 🔄 Auto-refresh localStorage every 3 minutes (180,000ms)
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      const user = localStorage.getItem("user");
      if (user) {
        localStorage.setItem("user", user); // Re-save to prevent expiration
      }
    }, 180000); 

    return () => clearInterval(refreshInterval);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); 
    setIsLoading(true);

    try {
      const usersRef = collection(firestore, "user");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();

        if (userData.password === password) {
          localStorage.setItem("user", JSON.stringify(userData));

          // ✅ Navigate first, then reload in a controlled manner
          navigate("/dashboard", { replace: true });

          // ✅ Avoid unnecessary refresh; use state updates instead
          setTimeout(() => {
            window.location.href = "/dashboard"; // Ensures correct navigation
          }, 500); 
        } else {
          setError("Invalid password");
          setIsLoading(false);
        }
      } else {
        setError("No user found with that username");
        setIsLoading(false);
      }
    } catch (err) {
      setError("Error logging in. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Admin Login</h2>
      {error && <p className="error">{error}</p>}

      {isLoading ? (
        <div className="preloader">
          <h2>Logging in...</h2>
          <p>Please wait while we verify your credentials</p>
        </div>
      ) : (
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Log In</button>
        </form>
      )}
    </div>
  );
};

export default Login;
