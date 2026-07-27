import { useEffect, useRef, useState } from "react";

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { id: string; name: string }[];
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
}

const CustomSelect = ({
  value,
  onChange,
  options,
  placeholder = "Choose from Drop-down",
  disabled = false,
  error = false,
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`h-11 w-full rounded-[6px] border bg-white px-4 text-sm text-[#111827] outline-none transition placeholder:text-[#98a2b3] focus:border-[#1B5DEF] focus:ring-2 focus:ring-[#dbe7ff] disabled:bg-[#f9fafb] flex items-center justify-between ${
          error ? "border-red-500" : "border-[#d0d5dd]"
        }`}
        disabled={disabled}
      >
        <span className={selectedOption ? "text-[#111827]" : "text-[#98a2b3]"}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <svg
          className={`h-5 w-5 text-[#667085] transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && !disabled && (
        <ul className="absolute left-0 right-0 z-10 mt-1 max-h-60 overflow-auto rounded-[6px] border border-[#d0d5dd] bg-white py-1 shadow-lg">
          {options.length === 0 ? (
            <li className="px-4 py-2 text-sm text-[#667085]">No options</li>
          ) : (
            options.map((opt) => (
              <li
                key={opt.id}
                onClick={() => {
                  onChange(opt.id);
                  setIsOpen(false);
                }}
                className={`cursor-pointer px-4 py-2 text-sm hover:bg-[#f0f5ff] ${
                  opt.id === value
                    ? "bg-[#dbe7ff] text-[#1B5DEF]"
                    : "text-[#111827]"
                }`}
              >
                {opt.name}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;
