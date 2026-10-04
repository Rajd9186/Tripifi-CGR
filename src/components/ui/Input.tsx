import { cn } from "@/lib/utils";

interface InputProps {
  label?: string;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  icon?: React.ReactNode;
}

export default function Input({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  className,
  icon,
}: InputProps) {
  return (
    <div className={className}>
      {label && <label className="input-label">{label}</label>}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500">
            {icon}
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={cn("field", icon ? "pl-10" : "")}
        />
      </div>
    </div>
  );
}
