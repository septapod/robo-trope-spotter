"use client";

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

export function TextInput({ value, onChange, disabled }: TextInputProps) {
  return (
    <textarea
      className="w-full h-48 rounded-xl bg-zinc-900 border border-zinc-800 p-4 text-zinc-100 placeholder-zinc-600 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      placeholder="paste something suspicious..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    />
  );
}
