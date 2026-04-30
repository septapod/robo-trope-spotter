interface Props {
  displayName: string;
  profileUrl: string | null;
}

/**
 * Small marginalia byline at the top of a report. Visible only when the
 * analyzer was signed in at the moment of analysis. Tone matches the
 * editorial-deadpan voice — quiet, attributive, not braggy.
 */
export function SpotterCredit({ displayName, profileUrl }: Props) {
  const name = profileUrl ? (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-zinc-700 underline underline-offset-4 hover:no-underline"
    >
      {displayName}
    </a>
  ) : (
    <span className="text-zinc-700">{displayName}</span>
  );

  return (
    <p className="px-6 pt-6 font-mono text-xs uppercase tracking-wider text-zinc-400">
      Spotted by {name}
    </p>
  );
}
