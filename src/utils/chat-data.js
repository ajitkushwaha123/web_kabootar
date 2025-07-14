import { format, isToday, isYesterday, isThisWeek } from "date-fns";

export const chatData = [
  {
    name: "Yong Tonghyon",
    time: "11:32 AM",
    message: "What makes it different from ...",
    unread: 2,
    dateGroup: "Today",
    typing: false,
    online: true,
    read: false,
    delivered: true,
  },
  {
    name: "Sarah Miller",
    time: "10:45 AM",
    message: "The project deadline is approachin...",
    dateGroup: "Today",
    typing: true,
    online: true,
  },
  {
    name: "David Chen",
    time: "9:20 AM",
    message: "Can we schedule a meeting f...",
    unread: 3,
    dateGroup: "Yesterday",
    typing: false,
    online: false,
  },
  {
    name: "Emma Thompson",
    time: "8:15 AM",
    message: "I reviewed the proposal and...",
    dateGroup: "Yesterday",
    typing: true,
    online: true,
  },
  {
    name: "James Wilson",
    time: "Yesterday",
    message: "The client loved our presentation!",
    dateGroup: "Monday",
    read: true,
    delivered: true,
  },
];

export const chatDataGrouped = chatData.reduce((acc, chat) => {
  acc[chat.dateGroup] = acc[chat.dateGroup] || [];
  acc[chat.dateGroup].push(chat);
  return acc;
}, {});

export const getDateGroup = (timestamp) => {
  const date = new Date(timestamp);

  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  if (isThisWeek(date)) return format(date, "EEEE");

  return format(date, "MMMM d");
};

const getDateGroupPriority = (group) => {
  if (group === "Today") return 0;
  if (group === "Yesterday") return 1;

  const weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const index = weekdays.indexOf(group);
  if (index !== -1) return 2 + index;

  return 1000;
};

export const getGroupedChatsSorted = (chatData) => {
  const grouped = chatData.reduce((acc, chat) => {
    acc[chat.dateGroup] = acc[chat.dateGroup] || [];
    acc[chat.dateGroup].push(chat);
    return acc;
  }, {});

  Object.keys(grouped).forEach((key) => {
    grouped[key].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  });

  const sorted = Object.keys(grouped)
    .sort((a, b) => getDateGroupPriority(a) - getDateGroupPriority(b))
    .reduce((acc, key) => {
      acc[key] = grouped[key];
      return acc;
    }, {});

  return sorted;
};
