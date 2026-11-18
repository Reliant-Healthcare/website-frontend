"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DatePickerProps {
  value?: string; // Expects "YYYY-MM-DD"
  onChange: (date: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  required?: boolean;
  id?: string;
  name?: string;
  minYear?: number;
  maxYear?: number;
  className?: string;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const WEEKDAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function DatePicker({
  value = "",
  onChange,
  disabled = false,
  readOnly = false,
  placeholder = "Select date...",
  required = false,
  id,
  name,
  minYear = 1920,
  maxYear = new Date().getFullYear() + 15,
  className = "",
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current value
  const parsedDate = useMemo(() => {
    if (!value) return null;
    const parts = value.split("-").map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      return { year: parts[0], month: parts[1] - 1, day: parts[2] };
    }
    return null;
  }, [value]);

  const today = useMemo(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
  }, []);

  const [viewYear, setViewYear] = useState<number>(parsedDate?.year || today.year);
  const [viewMonth, setViewMonth] = useState<number>(parsedDate?.month ?? today.month);

  // Sync view when value changes from outside
  useEffect(() => {
    if (parsedDate) {
      setViewYear(parsedDate.year);
      setViewMonth(parsedDate.month);
    }
  }, [parsedDate]);

  // Handle outside click to close
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  // Navigate months
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Generate calendar grid days
  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days: Array<{
      day: number;
      month: number;
      year: number;
      isCurrentMonth: boolean;
      isSelected: boolean;
      isToday: boolean;
      dateString: string;
    }> = [];

    // Previous month filler days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const m = viewMonth === 0 ? 11 : viewMonth - 1;
      const y = viewMonth === 0 ? viewYear - 1 : viewYear;
      const mStr = String(m + 1).padStart(2, "0");
      const dStr = String(dayNum).padStart(2, "0");
      days.push({
        day: dayNum,
        month: m,
        year: y,
        isCurrentMonth: false,
        isSelected: false,
        isToday: false,
        dateString: `${y}-${mStr}-${dStr}`,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const isSelected = !!parsedDate && parsedDate.year === viewYear && parsedDate.month === viewMonth && parsedDate.day === d;
      const isToday = today.year === viewYear && today.month === viewMonth && today.day === d;
      const mStr = String(viewMonth + 1).padStart(2, "0");
      const dStr = String(d).padStart(2, "0");
      days.push({
        day: d,
        month: viewMonth,
        year: viewYear,
        isCurrentMonth: true,
        isSelected,
        isToday,
        dateString: `${viewYear}-${mStr}-${dStr}`,
      });
    }

    // Next month filler days to complete grid (multiples of 7)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const m = viewMonth === 11 ? 0 : viewMonth + 1;
      const y = viewMonth === 11 ? viewYear + 1 : viewYear;
      const mStr = String(m + 1).padStart(2, "0");
      const dStr = String(i).padStart(2, "0");
      days.push({
        day: i,
        month: m,
        year: y,
        isCurrentMonth: false,
        isSelected: false,
        isToday: false,
        dateString: `${y}-${mStr}-${dStr}`,
      });
    }

    return days;
  }, [viewYear, viewMonth, parsedDate, today]);

  // Formatted display label
  const displayLabel = useMemo(() => {
    if (!parsedDate) return "";
    const mStr = MONTH_NAMES[parsedDate.month].substring(0, 3);
    return `${mStr} ${parsedDate.day}, ${parsedDate.year}`;
  }, [parsedDate]);

  // Year options for dropdown
  const yearOptions = useMemo(() => {
    const years: number[] = [];
    for (let y = maxYear; y >= minYear; y--) {
      years.push(y);
    }
    return years;
  }, [minYear, maxYear]);

  const selectDate = (dateStr: string) => {
    onChange(dateStr);
    setIsOpen(false);
  };

  const setTodayDate = () => {
    const mStr = String(today.month + 1).padStart(2, "0");
    const dStr = String(today.day).padStart(2, "0");
    selectDate(`${today.year}-${mStr}-${dStr}`);
  };

  const clearDate = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onChange("");
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Hidden input for standard form validation */}
      {name && (
        <input
          type="hidden"
          name={name}
          id={id}
          value={value}
          required={required && !disabled && !readOnly}
        />
      )}

      {/* Trigger Button */}
      <div
        onClick={() => {
          if (!disabled && !readOnly) setIsOpen(!isOpen);
        }}
        className={`w-full flex items-center justify-between border rounded-xl px-3.5 py-2.5 text-sm transition-all select-none ${
          disabled || readOnly
            ? "bg-muted/40 text-muted-foreground cursor-not-allowed border-border/80"
            : isOpen
            ? "bg-background border-primary ring-2 ring-primary/20 cursor-pointer shadow-sm"
            : "bg-background border-border hover:border-primary/60 cursor-pointer"
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <CalendarIcon className={`w-4 h-4 shrink-0 transition-colors ${isOpen || value ? "text-primary" : "text-muted-foreground"}`} />
          {value ? (
            <span className="font-medium text-foreground tracking-tight">
              {displayLabel} <span className="text-xs text-muted-foreground font-normal ml-1">({value})</span>
            </span>
          ) : (
            <span className="text-muted-foreground/70">{placeholder}</span>
          )}
        </div>

        {value && !disabled && !readOnly && (
          <button
            type="button"
            onClick={clearDate}
            className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0 ml-1"
            title="Clear date"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Floating Popover Calendar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-[calc(100%+6px)] z-50 w-[310px] sm:w-[320px] p-3.5 bg-card/95 backdrop-blur-md border border-border rounded-2xl shadow-2xl space-y-3"
          >
            {/* Header: Month / Year Controls */}
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5 flex-1">
                {/* Month Dropdown */}
                <select
                  value={viewMonth}
                  onChange={(e) => setViewMonth(Number(e.target.value))}
                  className="bg-muted/50 border border-border/70 text-xs font-bold rounded-lg px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  {MONTH_NAMES.map((m, idx) => (
                    <option key={m} value={idx}>
                      {m}
                    </option>
                  ))}
                </select>

                {/* Year Dropdown */}
                <select
                  value={viewYear}
                  onChange={(e) => setViewYear(Number(e.target.value))}
                  className="bg-muted/50 border border-border/70 text-xs font-bold rounded-lg px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prev / Next Month arrows */}
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekday Labels */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {WEEKDAY_NAMES.map((name) => (
                <span key={name} className="text-[11px] font-bold text-muted-foreground uppercase py-1">
                  {name}
                </span>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectDate(item.dateString)}
                  className={`h-8 rounded-lg text-xs font-medium transition-all flex items-center justify-center ${
                    item.isSelected
                      ? "bg-primary text-primary-foreground font-bold shadow-sm"
                      : item.isToday
                      ? "border border-primary text-primary font-bold hover:bg-primary/10"
                      : item.isCurrentMonth
                      ? "text-foreground hover:bg-muted"
                      : "text-muted-foreground/35 hover:bg-muted/30"
                  }`}
                >
                  {item.day}
                </button>
              ))}
            </div>

            {/* Footer Quick Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs font-semibold">
              <button
                type="button"
                onClick={setTodayDate}
                className="text-primary hover:underline px-1 py-0.5"
              >
                Today
              </button>
              <div className="flex items-center gap-2">
                {value && (
                  <button
                    type="button"
                    onClick={() => clearDate()}
                    className="text-destructive hover:underline px-1 py-0.5"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-2.5 py-1 bg-muted hover:bg-muted/80 rounded-md text-foreground transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

