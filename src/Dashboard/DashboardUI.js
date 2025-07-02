import { format } from "date-fns";
import "./Dashboard_css/Dashboard.css"; // Main dashboard CSS
import "./Dashboard_css/sidebar.css"; // Sidebar specific CSS
import Sidebar from "./sidebar"; // Import Sidebar component
import CustomCalendar from "./CustomCalendar"; // Import the real calendar component
import Header from "../Header/Header"; // Import Header component

const DashboardUI = ({
  view,
  setView,
  currentMonth,
  events,
  user,
  sidebarExpanded, // <-- receive sidebarExpanded from parent
  setSidebarExpanded, // <-- receive setSidebarExpanded from parent if you want to toggle from here
}) => {
  const today = format(new Date(), "dd MMMM yyyy");

  return (
    <div className="dashboard-container">
      {/* Sidebar - Pass user and expanded state */}
      <Sidebar user={user} expanded={sidebarExpanded} />

      {/* Main Content */}
      <div className="calendar-container">
        {/* Header */}
        <Header view={view} setView={setView} sidebarExpanded={sidebarExpanded} setSidebarExpanded={setSidebarExpanded} />

        {/* Custom Calendar with events and current month passed as props */}
        <CustomCalendar currentMonth={currentMonth} events={events} />
      </div>
    </div>
  );
};

export default DashboardUI;