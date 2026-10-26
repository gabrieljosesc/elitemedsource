const INPUT =
  "border rounded-xl px-3.5 py-2.5 text-[14px] bg-card outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all";

export function FormField({
  label,
  type = "text",
  value,
  onChange,
  required,
  error,
  placeholder,
  span2,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
  span2?: boolean;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${span2 ? "sm:col-span-2" : ""}`}>
      <span className="text-[13px] font-medium text-ink">
        {label}
        {required && <span className="text-low"> *</span>}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${INPUT} ${error ? "border-low" : "border-line"}`}
      />
      {error && <span className="text-[11.5px] text-low">{error}</span>}
    </label>
  );
}

export function FormSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-ink">{label}</span>
      <select value={value} onChange={onChange} className={`${INPUT} border-line`}>
        {children}
      </select>
    </label>
  );
}

export function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-line pt-5 flex flex-col gap-3">
      <h2 className="eyebrow">{title}</h2>
      {children}
    </div>
  );
}
