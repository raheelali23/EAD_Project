// utils/timeUtils.js
export function getRemainingTime(deadline) {
  const now = new Date();
  const end = new Date(deadline);
  const diff = end - now;

  if (diff > 0) {
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    return `${days}d ${hours}h remaining`;
  } else {
    const lateBy = Math.abs(diff);
    const days = Math.floor(lateBy / (1000 * 60 * 60 * 24));
    const hours = Math.floor((lateBy / (1000 * 60 * 60)) % 24);
    return `Late by ${days}d ${hours}h`;
  }
}
