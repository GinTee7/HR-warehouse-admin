import { useState, useRef, useEffect } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isWithinInterval,
} from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface DateRange {
  from?: Date;
  to?: Date;
}

interface CustomDateRangePickerProps {
  value: DateRange;
  onChange: (value: DateRange) => void;
  placeholder?: string;
  className?: string;
}

export function CustomDateRangePicker({
  value,
  onChange,
  placeholder = "Chọn khoảng thời gian",
  className = "",
}: CustomDateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [selecting, setSelecting] = useState<"start" | "end" | null>(null);
  const [tempRange, setTempRange] = useState<DateRange>({
    from: value.from,
    to: value.to,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Update local state when props change
  useEffect(() => {
    setTempRange({
      from: value.from,
      to: value.to,
    });

    // Set current month to start date if available
    if (value.from) {
      setCurrentMonth(value.from);
    }
  }, [value.from, value.to]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Get days in current month
  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };

  // Get day names
  const getDayNames = () => {
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return days;
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    if (!selecting || selecting === "start") {
      setTempRange({ from: date, to: undefined });
      setSelecting("end");
    } else {
      // If clicking a date before start date, swap them
      if (tempRange.from && date < tempRange.from) {
        setTempRange({ from: date, to: tempRange.from });
      } else {
        setTempRange({ ...tempRange, to: date });
      }
      setSelecting(null);
    }
  };

  // Handle date hover
  const handleDateHover = (date: Date) => {
    setHoverDate(date);
  };

  // Check if date is in preview range
  const isInPreviewRange = (date: Date) => {
    if (!selecting || selecting !== "end" || !tempRange.from || !hoverDate)
      return false;

    const start = tempRange.from < hoverDate ? tempRange.from : hoverDate;
    const end = tempRange.from < hoverDate ? hoverDate : tempRange.from;

    return isWithinInterval(date, { start, end });
  };

  // Check if date is in selected range
  const isInSelectedRange = (date: Date) => {
    if (!tempRange.from || !tempRange.to) return false;
    return isWithinInterval(date, { start: tempRange.from, end: tempRange.to });
  };

  // Handle apply button click
  const handleApply = () => {
    onChange(tempRange);
    setIsOpen(false);
    setSelecting(null);
  };

  // Handle clear button click
  const handleClear = () => {
    setTempRange({ from: undefined, to: undefined });
    setSelecting("start");
  };

  // Handle cancel button click
  const handleCancel = () => {
    setTempRange({
      from: value.from,
      to: value.to,
    });
    setIsOpen(false);
    setSelecting(null);
  };

  // Format display text
  const displayText = () => {
    if (value.from && value.to) {
      return `${format(value.from, "dd/MM/yyyy", { locale: vi })} - ${format(
        value.to,
        "dd/MM/yyyy",
        { locale: vi }
      )}`;
    } else if (value.from) {
      return format(value.from, "dd/MM/yyyy", { locale: vi });
    } else {
      return placeholder;
    }
  };

  // Render calendar
  const renderCalendar = () => {
    const days = getDaysInMonth();
    const dayNames = getDayNames();

    // Calculate empty cells before first day of month
    const firstDayOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const dayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const emptyCellsBefore = Array(dayOfWeek).fill(null);

    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-base font-medium">
            {format(currentMonth, "MMMM yyyy", { locale: vi })}
          </h2>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day, index) => (
            <div
              key={index}
              className="text-center text-xs font-medium text-gray-500 py-1"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {emptyCellsBefore.map((_, index) => (
            <div key={`empty-before-${index}`} className="h-8"></div>
          ))}

          {days.map((day, index) => {
            const isStart = tempRange.from && isSameDay(day, tempRange.from);
            const isEnd = tempRange.to && isSameDay(day, tempRange.to);
            const isSelected = isStart || isEnd;
            const isInRange = isInSelectedRange(day) || isInPreviewRange(day);

            return (
              <button
                key={index}
                type="button"
                onClick={() => handleDateClick(day)}
                onMouseEnter={() => handleDateHover(day)}
                className={`
                  h-8 w-8 flex items-center justify-center rounded-full text-sm
                  ${isSelected ? "bg-primary text-white" : ""}
                  ${isInRange && !isSelected ? "bg-primary/10" : ""}
                  ${!isSelected && !isInRange ? "hover:bg-gray-100" : ""}
                `}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>

        <div className="mt-4 text-xs text-gray-500">
          {selecting === "start" && "Chọn ngày bắt đầu"}
          {selecting === "end" && "Chọn ngày kết thúc"}
          {!selecting &&
            tempRange.from &&
            tempRange.to &&
            `${format(tempRange.from, "dd/MM/yyyy", { locale: vi })} - ${format(
              tempRange.to,
              "dd/MM/yyyy",
              { locale: vi }
            )}`}
        </div>

        <div className="flex justify-end mt-4 space-x-2">
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 focus:outline-none"
          >
            Xóa
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 focus:outline-none"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-3 py-1.5 text-sm bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            disabled={!tempRange.from}
          >
            Áp dụng
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Date Range Picker Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 text-sm border rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
      >
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-gray-500" />
          <span className={!value.from && !value.to ? "text-gray-500" : ""}>
            {displayText()}
          </span>
        </div>
        <svg
          className="w-5 h-5 ml-2 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 mt-1 bg-white border rounded-md shadow-lg w-full sm:w-auto min-w-[300px]">
          {renderCalendar()}
        </div>
      )}
    </div>
  );
}
