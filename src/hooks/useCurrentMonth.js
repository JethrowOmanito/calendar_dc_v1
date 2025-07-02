import { useState } from "react";
import { addMonths, subMonths, isValid } from "date-fns";

const useCurrentMonth = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const goToPreviousMonth = () => {
    setCurrentMonth((prevMonth) => {
      const newMonth = subMonths(prevMonth, 1);
      console.log("Previous Month:", newMonth, isValid(newMonth)); // Debug log
      return newMonth;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth((prevMonth) => {
      const newMonth = addMonths(prevMonth, 1);
      console.log("Next Month:", newMonth, isValid(newMonth)); // Debug log
      return newMonth;
    });
  };

  console.log("Current Month:", currentMonth, isValid(currentMonth)); // Debug log

  return { currentMonth, goToPreviousMonth, goToNextMonth, setCurrentMonth };
};

export default useCurrentMonth;
