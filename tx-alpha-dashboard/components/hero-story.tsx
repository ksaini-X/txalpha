import Link from "next/link";
import { Zap, Radio } from "lucide-react";

export function HeroStory() {
  return (
    <section className="mt-2 grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-10">
      <div className="lg:col-span-2">
        <h2 className="font-headline font-black text-ink leading-[0.95] text-4xl sm:text-5xl md:text-6xl mt-2">
          104 Matches, Real-Time Odds, Cryptographically Anchored.
          <span className="stamp text-xs">LIVE</span>
        </h2>

        <div className="mt-6 font-body text-[15px] leading-[1.65] text-ink font-press">
          <p className="dropcap">
            TxLINE streams live odds and match data across all 104 games, with
            every update cryptographically anchored on chain. No intermediaries.
            No delays. Just real-time data your autonomous agents can trust.
          </p>
        </div>

        <Link
          href="/matches"
          className="inline-block bg-ink text-newsprint font-press uppercase tracking-[0.2em] text-xs px-6 py-3 mt-4 hover:bg-ink/80 transition-colors"
        >
          Mactches
        </Link>
      </div>

      <aside className="border-l-0 lg:border-l border-ink lg:pl-8">
        <div className=" border-b-4  py-2 text-center">
          <p className="font-press text-[11px] uppercase tracking-[0.3em] text-ink">
            Live Bulletin
          </p>
        </div>

        <ul className="mt-4 divide-y divide-ink/40">
          {[
            {
              tag: "ODDS",
              title: "Argentina vs France | 1.92 / 3.50 / 4.20",
            },
            {
              tag: "STREAM",
              title: "104 matches live on TxLINE network",
            },
            {
              tag: "CHAIN",
              title: "All data verified on Solana blockchain",
            },
            {
              tag: "AGENTS",
              title: "Build autonomous strategies now",
            },
          ].map((item) => (
            <li key={item.title} className="py-3">
              <span className="font-press text-[10px] uppercase tracking-[0.25em] text-stamp">
                {item.tag}
              </span>
              <p className="font-headline text-lg leading-tight text-ink mt-1">
                {item.title}
              </p>
            </li>
          ))}
        </ul>
      </aside>
    </section>
  );
}
