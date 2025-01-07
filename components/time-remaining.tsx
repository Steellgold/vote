"use client";

import { Dayjs, dayJS } from "@/lib/day-js";
import { Component } from "@/lib/types";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export const TimeRemaining: Component<{ targetDate: Dayjs }> = ({ targetDate }) => {
  const [timeRemaining, setTimeRemaining] = useState("");
  const t = useTranslations("TimeRemaining")

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = dayJS();
      const target = dayJS(targetDate);
      const diff = target.diff(now);
      
      if (diff <= 0) {
        setTimeRemaining("x");
        return;
      }

      const duration = dayJS.duration(diff);
      
      const days = Math.floor(duration.asDays());
      const hours = duration.hours();
      const minutes = duration.minutes();
      const seconds = duration.seconds();

      const parts = [];
      if (days) parts.push(t(days === 1 ? "Day" : "Days", { number: days }));
      if (hours) parts.push(t(hours === 1 ? "Hour" : "Hours", { number: hours }));
      if (minutes) parts.push(t(minutes === 1 ? "Minute" : "Minutes", { number: minutes }));
      if (seconds) parts.push(t(seconds === 1 ? "Second" : "Seconds", { number: seconds }));

      setTimeRemaining(parts.join(", "));
    };

    calculateTimeRemaining();
    
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <span>{timeRemaining}</span>
  );
};