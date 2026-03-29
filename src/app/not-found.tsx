import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16 bg-surface-0 gradient-mesh">
      <div className="text-center space-y-6">
        <h1 className="font-display text-8xl font-bold text-candy-pink">
          404
        </h1>
        <p className="text-zinc-500 text-lg max-w-sm mx-auto leading-relaxed">
          This report doesn&apos;t exist, or it expired.
        </p>
        <Link
          href="/"
          className="inline-block rounded-3xl bg-candy-pink text-white font-display font-bold px-8 py-4 text-base shadow-lg shadow-candy-pink/20 hover:brightness-110 transition-all"
        >
          Analyze some text
        </Link>
      </div>
    </main>
  );
}
