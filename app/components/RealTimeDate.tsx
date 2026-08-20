"use client";

import { useEffect, useState } from "react";

function formatDateTime(date: Date) {
  const parts = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";

  return {
    date: `${get("weekday")}, ${get("day")} ${get("month")} ${get("year")}`,
    time: `${get("hour")}:${get("minute")}:${get("second")} WIB`,
  };
}

export default function RealTimeDate() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const formatted = formatDateTime(now);

  return (
    <div className="realTimeDate" aria-live="polite">
      <div className="dateLabel">Tanggal</div>
      <strong>{formatted.date}</strong>
      <span>{formatted.time} · Real Time</span>
    </div>
  );
}
