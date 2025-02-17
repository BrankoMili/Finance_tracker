import { Timestamp } from "firebase/firestore";

export const useMonth = () => {
  const date = new Date();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  const monthName = monthNames[date.getMonth()];
  const currentYear = date.getUTCFullYear();
  const currentMonth = date.getUTCMonth();

  const startDate = new Date(Date.UTC(currentYear, currentMonth, 1)); // First day of month
  const endDate = new Date(Date.UTC(currentYear, currentMonth + 1, 1)); // First day of next month

  // 3. Convert to Firestore Timestamps
  const startTimestamp = Timestamp.fromDate(startDate);
  const endTimestamp = Timestamp.fromDate(endDate);

  return {
    monthName,
    startTimestamp,
    endTimestamp
  };
};
