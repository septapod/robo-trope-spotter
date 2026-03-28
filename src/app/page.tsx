export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            Robo Trope Spotter
          </h1>
          <p className="text-zinc-400 text-lg">
            Paste text. See the tropes. Get the report card.
          </p>
        </div>

        <textarea
          className="w-full h-48 rounded-xl bg-zinc-900 border border-zinc-800 p-4 text-zinc-100 placeholder-zinc-600 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
          placeholder="paste something suspicious..."
        />

        <button className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 transition-colors">
          Analyze
        </button>
      </div>
    </main>
  );
}
