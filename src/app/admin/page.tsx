'use client';

import { useState, useEffect, useCallback } from 'react';

interface ReportRow {
  slug: string;
  inputType: string;
  score: number | null;
  label: string | null;
  wordCount: number | null;
  tropesDetected: number | null;
  createdAt: string;
}

interface AdminData {
  total: number;
  today: number;
  reports: ReportRow[];
}

interface ShareEventRow {
  id: string;
  reportSlug: string;
  method: string;
  createdAt: string;
}

interface ScoreBand {
  bandLabel: string;
  reportCount: number;
  shareCount: number;
  rate: number;
}

interface SharesData {
  totalShares: number;
  sharesToday: number;
  shareRate: number;
  byScoreBand: ScoreBand[];
  events: ShareEventRow[];
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [data, setData] = useState<AdminData | null>(null);
  const [shares, setShares] = useState<SharesData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reports');
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      const json = await res.json();
      setData(json);
      setAuthed(true);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchShares = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/shares');
      if (!res.ok) return;
      const json = await res.json();
      setShares(json);
    } catch {
      // ignore
    }
  }, []);

  // Check if already authed on mount
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    if (authed) fetchShares();
  }, [authed, fetchShares]);

  const handleLogin = async () => {
    setAuthError('');
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuthed(true);
      fetchReports();
      fetchShares();
    } else {
      setAuthError('Wrong password.');
    }
  };

  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface-0 px-4">
        <div className="w-full max-w-sm space-y-4">
          <h1 className="font-display text-2xl font-bold text-zinc-900">Admin</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Password"
            className="w-full rounded-xl border-2 border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-candy-pink focus:outline-none"
            autoFocus
          />
          <button
            onClick={handleLogin}
            className="w-full rounded-xl bg-candy-pink py-3 font-semibold text-white hover:bg-pink-600 transition-colors"
          >
            Log in
          </button>
          {authError && (
            <p className="text-sm text-red-500 text-center">{authError}</p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface-0 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-baseline justify-between mb-8">
          <h1 className="font-display text-3xl font-bold text-zinc-900">Reports</h1>
          <div className="flex gap-6 font-mono text-sm text-zinc-500">
            <span>Total: <strong className="text-zinc-900">{data?.total ?? 0}</strong></span>
            <span>Today: <strong className="text-candy-pink">{data?.today ?? 0}</strong></span>
          </div>
        </div>

        {loading && !data && (
          <p className="text-zinc-500 font-mono text-sm">Loading...</p>
        )}

        {data && data.reports.length === 0 && (
          <p className="text-zinc-500 text-sm">No reports yet.</p>
        )}

        {data && data.reports.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-left text-xs font-mono uppercase tracking-wider text-zinc-500">
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Label</th>
                  <th className="px-4 py-3">Words</th>
                  <th className="px-4 py-3">Tropes</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.reports.map((r) => (
                  <tr
                    key={r.slug}
                    className="border-b border-zinc-50 hover:bg-surface-2/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <a
                        href={`/report/${r.slug}`}
                        className="font-mono text-candy-pink hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {r.slug}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">{r.inputType}</td>
                    <td className="px-4 py-3 font-mono font-bold text-zinc-900">
                      {r.score ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{r.label ?? '-'}</td>
                    <td className="px-4 py-3 font-mono text-zinc-500">
                      {r.wordCount ?? '-'}
                    </td>
                    <td className="px-4 py-3 font-mono text-zinc-500">
                      {r.tropesDetected ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 font-mono text-xs">
                      {r.createdAt
                        ? new Date(r.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <SharesPanel shares={shares} />
      </div>
    </main>
  );
}

function SharesPanel({ shares }: { shares: SharesData | null }) {
  const sharePct = (n: number) => `${(n * 100).toFixed(1)}%`;

  return (
    <section className="mt-12">
      <div className="flex items-baseline justify-between mb-8">
        <h2 className="font-display text-2xl font-bold text-zinc-900">Shares</h2>
        <div className="flex gap-6 font-mono text-sm text-zinc-500">
          <span>14d: <strong className="text-zinc-900">{shares?.totalShares ?? 0}</strong></span>
          <span>Today: <strong className="text-zinc-900">{shares?.sharesToday ?? 0}</strong></span>
          <span>Rate: <strong className="text-zinc-900">{shares ? sharePct(shares.shareRate) : '-'}</strong></span>
        </div>
      </div>

      {!shares && (
        <p className="text-zinc-500 font-mono text-sm">Loading...</p>
      )}

      {shares && shares.byScoreBand.length > 0 && (
        <div className="mb-6 overflow-x-auto rounded-xl border border-zinc-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-left text-xs font-mono uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-3">Band</th>
                <th className="px-4 py-3">Reports</th>
                <th className="px-4 py-3">Shares</th>
                <th className="px-4 py-3">Rate</th>
              </tr>
            </thead>
            <tbody>
              {shares.byScoreBand.map((b) => (
                <tr key={b.bandLabel} className="border-b border-zinc-50 hover:bg-surface-2/50 transition-colors">
                  <td className="px-4 py-3 text-zinc-700">{b.bandLabel}</td>
                  <td className="px-4 py-3 font-mono text-zinc-500">{b.reportCount}</td>
                  <td className="px-4 py-3 font-mono text-zinc-500">{b.shareCount}</td>
                  <td className="px-4 py-3 font-mono text-zinc-900">{sharePct(b.rate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {shares && shares.events.length === 0 && (
        <p className="text-zinc-500 text-sm">No share events yet.</p>
      )}

      {shares && shares.events.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-left text-xs font-mono uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {shares.events.map((e) => (
                <tr key={e.id} className="border-b border-zinc-50 hover:bg-surface-2/50 transition-colors">
                  <td className="px-4 py-3">
                    <a
                      href={`/report/${e.reportSlug}`}
                      className="font-mono text-link-pink hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {e.reportSlug}
                    </a>
                  </td>
                  <td className="px-4 py-3 font-mono text-zinc-500">{e.method}</td>
                  <td className="px-4 py-3 text-zinc-500 font-mono text-xs">
                    {new Date(e.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
