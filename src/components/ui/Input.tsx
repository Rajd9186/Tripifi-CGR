import { cn } from "@/lib/utils";

interface InputProps {
  label?: string;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  icon?: React.ReactNode;
  error?: string;
  id?: string;
  min?: string;
}

export default function Input({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  className,
  icon,
  error,
  id,
  min,
}: InputProps) {
  return (
    <div className={className}>
      {label && <label className="input-label" htmlFor={id}>{label}</label>}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500">
            {icon}
          </div>
        )}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          min={min}
          aria-invalid={Boolean(error)}
          className={cn("field", icon ? "pl-10" : "", error && "border-red-500")}
        />
      </div>
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
