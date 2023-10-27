export {};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // console.log("got message", request, sender);
  if (request.message === "get_calendar_events") {
    chrome.identity.getAuthToken({ interactive: true }, async function (token) {
      //initialization (think they're all the same)
      let init = {
        method: "GET",
        async: true,
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        contentType: "json",
      };
      async function getAllCalendarIds(): Promise<string[]> {
        return new Promise((resolve, reject) => {
          fetch(
            "https://www.googleapis.com/calendar/v3/users/me/calendarList",
            init
          )
            .then((response) => response.json()) // Transform the data into json
            .then(function (data) {
              // console.log("got all calendars", data);
              var ids = data.items
                .filter((item: any) => item.accessRole === "owner")
                .map((item: any) => item.id);
              resolve(ids);
            });
        });
      }

      let allCalendarIds = await getAllCalendarIds();
      const allEvents: any[] = [];
      await Promise.all(
        allCalendarIds.map(async (calendarId: string) =>
          fetch(
            "https://www.googleapis.com/calendar/v3/calendars/" +
              calendarId +
              `/events?singleEvents=true&orderBy=startTime&timeMin=${request.data.dateRange[0]}&timeMax=${request.data.dateRange[1]}`,

            init
          )
            .then((response) => response.json()) // Transform the data into json
            .then(async function (data) {
              //get today to next week's events
              if (!data.items) return;
              const events = data.items
                .filter(
                  (item: any) =>
                    item.start.hasOwnProperty("dateTime") &&
                    item.end.hasOwnProperty("dateTime") &&
                    (request.data.isWeekly
                      ? item.hasOwnProperty("recurringEventId")
                      : true)
                )
                .map((item: any) => ({
                  title: item.summary,
                  start: {
                    hour: new Date(item.start.dateTime).getHours(),
                    minute: new Date(item.start.dateTime).getMinutes(),
                    dayOfWeek: new Date(item.start.dateTime).getDay(),
                    date: new Date(item.start.dateTime),
                  },
                  end: {
                    hour: new Date(item.end.dateTime).getHours(),
                    minute: new Date(item.end.dateTime).getMinutes(),
                    dayOfWeek: new Date(item.end.dateTime).getDay(),
                    date: new Date(item.end.dateTime),
                  },
                }));
              // console.log("got calendar data", events);
              allEvents.push(events);
            })
        )
      );
      // console.log("all events", allEvents.flat());
      sendResponse({ events: allEvents.flat(), data: request.data });
    });
  }
  return true;
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log("[background.js] tab updated", tabId, changeInfo, tab);
  if (
    changeInfo.status === "complete" &&
    tab.active &&
    tab.url?.includes("//www.when2meet.com/?")
  ) {
    chrome.tabs.sendMessage(tabId, { message: "page_loaded" }, (response) => {
      console.log("got back", response);
    });
  }
});
