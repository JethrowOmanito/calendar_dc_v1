import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./AuthService/Login/Login";
import Dashboard from "./Dashboard/Dashboard";
import CreateEvent from "./Dashboard/CreateEvent/CreateEvent";
import CheckAvailability from "./Header/CheckAvailability";
import SearchPage from "./Header/SearchPage";
import SettingsPage from "./Header/SettingsPage";
import ConvertExcel from "./Header/ConvertExcel";
import CheckCleanerSchedule from "./Header/CheckCleanerSchedule";

function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")) || null);

  useEffect(() => {
    if (!user) {
      localStorage.removeItem("user");
    }
  }, [user]);

  return (
    <Router>
      <Routes>
        {/* Login Route */}
        <Route 
          path="/" 
          element={user ? <Navigate to="/dashboard" replace /> : <Login setUser={setUser} />} 
        />

        {/* Dashboard Route */}
        <Route 
          path="/dashboard" 
          element={user ? (
            <Dashboard 
              setUser={setUser} 
              user={user} 
            />
          ) : (
            <Navigate to="/" replace />
          )}
        />

        {/* Create Event Route */}
        <Route 
          path="/create-event" 
          element={user ? (
            <CreateEvent 
              setUser={setUser} 
              user={user} 
            />
          ) : (
            <Navigate to="/" replace />
          )}
        />

        {/* Check Availability Route */}
        <Route 
          path="/check-availability" 
          element={user ? (
            <CheckAvailability />
          ) : (
            <Navigate to="/" replace />
          )}
        />

        {/* Check Cleaner Schedule Route */}
        <Route 
          path="/check-cleaner-schedule" 
          element={user ? (
            <CheckCleanerSchedule />
          ) : (
            <Navigate to="/" replace />
          )}
        />

        {/* Search Page Route */}
        <Route 
          path="/search" 
          element={user ? (
            <SearchPage />
          ) : (
            <Navigate to="/" replace />
          )}
        />

        {/* Settings Page Route */}
        <Route 
          path="/settings" 
          element={user ? (
            <SettingsPage setUser={setUser} />
          ) : (
            <Navigate to="/" replace />
          )}
        />

        {/* Convert Excel Route */}
        <Route 
          path="/convert-excel" 
          element={user ? (
            <ConvertExcel />
          ) : (
            <Navigate to="/" replace />
          )}
        />

        {/* 404 Not Found Route */}
        <Route 
          path="*"
          element={<Navigate to={user ? "/dashboard" : "/"} replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;