export function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);

  if (isNaN(date)) return "";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
