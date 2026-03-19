// utils/formatTime.js
export function formatMessageTime(dateInput) {
  const date = new Date(dateInput);

  if (isNaN(date.getTime())) return "";

  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const options = { hour: "numeric", minute: "2-digit" };

  if (isToday) {
    return date.toLocaleTimeString([], options); 
  } else if (isYesterday) {
    return `Yesterday, ${date.toLocaleTimeString([], options)}`;
  } else {
    return date.toLocaleDateString([], {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    }); // e.g. 5 Oct, 10:45 PM
  }
}
