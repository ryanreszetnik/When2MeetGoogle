import { ChromeMessage } from "../types";
const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TIMES_OF_DAY = [
  "12:00  AM",
  "1:00  AM",
  "2:00  AM",
  "3:00  AM",
  "4:00  AM",
  "5:00  AM",
  "6:00  AM",
  "7:00  AM",
  "8:00  AM",
  "9:00  AM",
  "10:00  AM",
  "11:00  AM",
  "12:00  PM",
  "1:00  PM",
  "2:00  PM",
  "3:00  PM",
  "4:00  PM",
  "5:00  PM",
  "6:00  PM",
  "7:00  PM",
  "8:00  PM",
  "9:00  PM",
  "10:00  PM",
  "11:00  PM",
];

type MessageResponse = (response?: any) => void;

const getDateRange = (dates: string[]) => {
  if (!dates[0]?.length) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(new Date().getDate() + 7);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    return [startDate.toISOString(), endDate.toISOString()];
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

const getTimesFromScreen = () => {
  const timeDivs = document.getElementById("GroupGrid")?.children[2].children;
  const times = [];
  if (timeDivs === undefined) {
    return;
  }
  for (let i = 0; i < timeDivs.length; i++) {
    if (timeDivs[i].children[0].children.length > 0) {
      times.push(timeDivs[i].children[0].children[0].textContent?.trim());
    }
  }
  const dateDivs = document.getElementById("GroupGrid")?.children[3].children;
  const dates = [];
  const daysOfWeek = [];
  if (dateDivs === undefined) {
    return;
  }
  for (let i = 0; i < dateDivs.length - 1; i++) {
    daysOfWeek.push((dateDivs[i].children[1] as HTMLElement).innerText);
    dates.push(
      dateDivs[i].textContent?.replace(
        (dateDivs[i].children[1] as HTMLElement).innerText ?? "",
        ""
      ) ?? ""
    );
  }
  return {
    dateRange: getDateRange(dates),
    isWeekly: !dates[0]?.length,
    times,
    dates,
    daysOfWeek,
  };
};

const messagesFromReactAppListener = (
  message: ChromeMessage,
  sender: chrome.runtime.MessageSender,
  response: MessageResponse
) => {
  // console.log("[content.ts] message", message, sender);

  if (message.message === "page_loaded") {
    // console.log("[content.ts] page loaded 2");
    onPageLoaded();
  }
};

const main = () => {
  // console.log("[content.ts] Main");
  /**
   * Fired when a message is sent from either an extension process or a content script.
   */
  chrome.runtime.onMessage.addListener(messagesFromReactAppListener);
};

function triggerMouseEvent(targetNode: HTMLElement, eventType: string) {
  var clickEvent = document.createEvent("MouseEvents");
  clickEvent.initEvent(eventType, true, true);
  targetNode.dispatchEvent(clickEvent);
}
const selectRange = (start: number[], end: number[]) => {
  const myGrid = document.getElementById("YouGridSlots");
  const startNode = myGrid?.children[start[0]].children[
    start[1]
  ] as HTMLDivElement;
  const endNode = myGrid?.children[end[0]].children[end[1]] as HTMLDivElement;
  triggerMouseEvent(startNode, "mousedown");
  triggerMouseEvent(endNode, "mouseover");
  triggerMouseEvent(endNode, "mouseup");
};
const clearAvailibility = () => {
  const myGrid = document.getElementById("YouGridSlots") as HTMLDivElement;
  // const;
  for (let i = 0; i < myGrid.children.length; i++) {
    for (let j = 0; j < myGrid?.children[i].children.length; j++) {
      const node = myGrid?.children[i].children[j] as HTMLDivElement;
      const style = window.getComputedStyle(node);
      if (style.backgroundColor === "rgb(51, 153, 0)") {
        triggerMouseEvent(node, "mousedown");
        triggerMouseEvent(node, "mouseup");
      }
    }
  }
};
const fillOutDay = (
  dayIndex: number,
  events: any[],
  startTime: number,
  endTime: number
) => {
  const eventTimes = events.map((event) => [
    Math.floor(4 * (event.start.hour + event.start.minute / 60)) / 4,
    event.end.hour + event.end.minute / 60,
  ]);
  const filledSlots = [...new Array((endTime - startTime) * 4)].map((_, i) => {
    const time = startTime + i / 4;
    // console.log("checking time", time, eventTimes);
    return !eventTimes.some((event) => event[0] <= time && event[1] > time);
  });
  const areas: any[] = [];
  let currentAreaStart: any = null;

  filledSlots.forEach((filled, i) => {
    if (filled && currentAreaStart === null) {
      currentAreaStart = i;
    } else if (!filled && currentAreaStart !== null) {
      areas.push([currentAreaStart, i - 1]);
      currentAreaStart = null;
    } else if (filled && i === filledSlots.length - 1) {
      areas.push([currentAreaStart, i]);
    }
  });
  // console.log("areas", areas);
  areas.forEach((area) =>
    selectRange([area[0], dayIndex], [area[1], dayIndex])
  );
  // console.log("filling out day", dayIndex, events, areas);
};

const daysEqual = (d1: Date, d2: Date) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};
const fillOutPage = (data: any, events: any) => {
  if (data.isWeekly) {
    // for each day of the week on the screen get the events
    const daysOfWeek: number[] = data.daysOfWeek.map((d: string) =>
      DAYS_OF_WEEK.indexOf(d)
    );
    // console.log("days of week", daysOfWeek, data);
    daysOfWeek.forEach((dayIndex, i) => {
      fillOutDay(
        i,
        events.filter((e: any) => e.start.dayOfWeek === dayIndex),
        TIMES_OF_DAY.indexOf(data.times[0]),
        TIMES_OF_DAY.indexOf(data.times[data.times.length - 1])
      );
    });
  } else {
    //for each date on the screen get the events
    const dates: Date[] = data.dates.map((d: string) => {
      const date = new Date(d);
      date.setFullYear(new Date().getFullYear());
      if (date < new Date()) {
        date.setFullYear(new Date().getFullYear() + 1);
      }
      return date;
    });
    // console.log("dates", dates, data);
    dates.forEach((date, i) => {
      fillOutDay(
        i,
        events.filter((e: any) => daysEqual(new Date(e.start.date), date)),
        TIMES_OF_DAY.indexOf(data.times[0]),
        TIMES_OF_DAY.indexOf(data.times[data.times.length - 1])
      );
    });
  }
};

const onPageLoaded = () => {
  let signInCollection = document.getElementsByClassName("GridSubtitle");
  if (!signInCollection) {
    return;
  }
  let availibility = document.getElementById("YouGrid") as HTMLDivElement;
  var btn = document.createElement("input");
  btn.type = "button";
  btn.value = "Autofill Availibility";
  var brEl = document.createElement("br");

  btn.addEventListener("click", () => {
    clearAvailibility();
    chrome.runtime.sendMessage(
      { message: "get_calendar_events", data: getTimesFromScreen() },
      (ret) => {
        fillOutPage(ret.data, ret.events);
      }
    );
  });

  availibility.insertBefore(btn, availibility.children[1]);
  availibility.insertBefore(brEl, availibility.children[1]);
};
main();
