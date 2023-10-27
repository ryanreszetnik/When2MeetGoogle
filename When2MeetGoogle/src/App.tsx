import React from "react";
import "./App.css";

export const App = () => {
  return (
    <div className="App">
      <h1>When2MeetGoogle</h1>
      <div>
        This exension adds an autofill button to the screen where you select
        your availibility. Clicking it will check the calendar of the google
        profile you are signed into and fill your availibility based on all
        events in the calendars you own.
      </div>
    </div>
  );
};
