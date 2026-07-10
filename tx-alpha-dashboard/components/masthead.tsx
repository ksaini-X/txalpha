export function Masthead() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="text-center">
      <h1 className="font-headline text-ink mt-2 leading-[0.9] text-5xl sm:text-7xl md:text-8xl">
        TXALPA
      </h1>

      <p className="font-press text-xs sm:text-sm uppercase tracking-[0.3em] text-ink-soft mt-1">
        Real-Time Sports Data || Cryptographically Verifiable
      </p>
      <div className="rule-double mt-5 py-2 flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px] uppercase tracking-[0.2em] font-press text-ink">
        <span>{today}</span>
        <span>TxLINE Data Network</span>
      </div>
    </header>
  );
}
