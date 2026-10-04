import { cn } from "@/lib/utils";

interface SelectProps {
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  className?: string;
}

export default function Select({
  label,
  value,
  onChange,
  children,
  className,
}: SelectProps) {
  return (
    <div className={className}>
      {label && <label className="input-label">{label}</label>}
      <select className="field" value={value} onChange={onChange}>
        {children}
      </select>
    </div>
  );
}
