import { useNavigate } from "react-router-dom";

const useLogout = (setUser) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user"); // Clear user data from local storage
    setUser(null); // Reset the user state
    console.log("Navigating to login page");
    navigate("/", { replace: true }); // Navigate to the login page
  };
  

  return handleLogout;
};

export default useLogout;
