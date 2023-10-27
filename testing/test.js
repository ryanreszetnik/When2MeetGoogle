// const dates = ["Feb  7", "Feb 20"];
const dates = [""];
const daysOfWeek = ["Tue", "Wed", "Thu"];
const times = ["3:00  AM", "8:00  PM"];

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIMES_OF_DAY = [
  "12:00 AM",
  "1:00 AM",
  "2:00 AM",
  "3:00 AM",
  "4:00 AM",
  "5:00 AM",
  "6:00 AM",
  "7:00 AM",
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "8:00 PM",
  "9:00 PM",
  "10:00 PM",
  "11:00 PM",
];

const parseDateRange = (dates, daysOfWeek, times) => {
  const parsedTimes = times.map((time) => {
    return TIMES_OF_DAY.indexOf(time);
  });
  const parsedDays = daysOfWeek.map((day) => {
    return DAYS_OF_WEEK.indexOf(day);
  });
  const parsedDates = dates.map((date, i) => {
    const dat = new Date(date);
    dat.setFullYear(new Date().getFullYear());
    if (dat < new Date()) {
      dat.setFullYear(new Date().getFullYear() + 1);
    }
    if (i > 0) {
      dat.setHours(23, 59, 59, 999);
    }
    return dat;
  });
  return parsedDates;
};
const getDateRange = (dates) => {
  if (!dates[0]?.length) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(new Date().getDate() + 7);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    return [startDate, endDate];
  }
  const startDate = new Date(dates[0]);
  const endDate = new Date(dates[dates.length - 1]);
  endDate.setHours(23, 59, 59, 999);
  startDate.setHours(0, 0, 0, 0);
  startDate.setFullYear(new Date().getFullYear());
  endDate.setFullYear(new Date().getFullYear());
  if (startDate < new Date()) {
    startDate.setFullYear(new Date().getFullYear() + 1);
  }
  if (endDate < new Date()) {
    endDate.setFullYear(new Date().getFullYear() + 1);
  }
  return [startDate.toISOString(), endDate.toISOString()];
};

console.log(getDateRange(dates));
