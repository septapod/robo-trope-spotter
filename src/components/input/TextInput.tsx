"use client";

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

export function TextInput({ value, onChange, disabled }: TextInputProps) {
  return (
    <div className="relative">
      <label htmlFor="text-input" className="sr-only">
        Text to analyze
      </label>
      <textarea
        id="text-input"
        className="focus-glow w-full h-56 rounded-3xl bg-white border-3 border-zinc-200 p-6 text-zinc-900 text-base leading-relaxed placeholder-zinc-500 resize-none transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed font-sans shadow-sm hover:border-zinc-300 hover:shadow-md"
        style={{ borderWidth: '3px' }}
        placeholder="paste something suspicious..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
      {value.length > 0 && (
        <span className="absolute bottom-4 right-5 font-mono text-sm text-zinc-500 tabular-nums bg-white/80 px-2 py-0.5 rounded-lg backdrop-blur-sm">
          {value.length.toLocaleString()} chars
        </span>
      )}
    </div>
  );
}
