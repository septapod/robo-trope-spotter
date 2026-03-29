"use client";

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

export function TextInput({ value, onChange, disabled }: TextInputProps) {
  return (
    <div className="relative">
      <textarea
        className="focus-glow w-full h-52 rounded-2xl bg-white border-2 border-zinc-200 p-5 text-zinc-900 text-[15px] leading-relaxed placeholder-zinc-400 resize-none transition-all disabled:opacity-30 disabled:cursor-not-allowed font-sans shadow-sm"
        placeholder="paste something suspicious..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
      {value.length > 0 && (
        <span className="absolute bottom-3 right-4 font-mono text-sm text-zinc-400 tabular-nums">
          {value.length.toLocaleString()} chars
        </span>
      )}
    </div>
  );
}
