import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <main className="bg-newsprint text-ink min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-8">
        {/* Masthead */}
        <header>
          <div className="border-y-4 border-double border-ink py-2 flex justify-between items-center text-[11px] uppercase tracking-[0.3em] font-press text-ink-soft">
            <span>{today}</span>
            <span>WORLD CUP SPECIAL EDITION</span>
            <span>TxLINE DATA NETWORK</span>
          </div>

          <h1 className="text-center font-headline text-7xl md:text-9xl leading-none tracking-tight mt-6">
            TXALPA
          </h1>

          <p className="text-center font-press uppercase tracking-[0.45em] text-xs mt-2 text-ink-soft">
            Real-Time Sports Data • Consensus Odds • Cryptographically Verified
          </p>

          <div className="border-b-4 border-double border-ink mt-6" />
        </header>

        {/* Front Page */}
        <section className="grid lg:grid-cols-12 gap-10 mt-10">
          {/* Lead Story */}
          <article className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 border border-ink px-3 py-1 text-[10px] uppercase tracking-[0.3em] font-press">
              Front Page
            </div>

            <h2 className="font-headline text-5xl md:text-7xl leading-[0.92] tracking-tight mt-6">
              Track Every Match.
              <br />
              Trust Every Result.
            </h2>

            <p className="font-headline italic text-xl mt-6 border-l-4 border-ink pl-5 text-ink-soft">
              A modern newspaper powered entirely by live sports infrastructure.
            </p>

            <div className="columns-1 md:columns-2 gap-10 mt-10 font-press text-[15px] leading-8 text-ink/80">
              <p className="dropcap mb-6">
                TXALPA brings together live fixtures, consensus betting odds,
                historical archives and cryptographically verified match
                outcomes into a single experience. Instead of switching between
                multiple dashboards, APIs and data providers, everything is
                organized like the front page of a daily newspaper.
              </p>

              <p className="mb-6">
                Built on the TxLINE network, every update follows the same
                trusted pipeline—from live events to verified results—giving
                developers, prediction markets and autonomous agents a reliable
                source of truth for every World Cup fixture.
              </p>
            </div>

            <div className=" pt-4">
              <Link
                href="/matches"
                className="group inline-flex items-center gap-2 border border-ink px-6 py-3 hover:bg-ink hover:text-newsprint transition font-press uppercase tracking-[0.2em] text-xs"
              >
                Open Dashboard
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </article>

          <aside className="lg:col-span-4 border-l border-ink/20 lg:pl-8">
            <div className="mt-4">
              <p className="font-press uppercase tracking-[0.25em] text-[10px] text-stamp">
                Published By
              </p>

              <p className="font-headline text-2xl mt-2">TxLINE Data Network</p>

              <p className="font-press mt-3 text-sm leading-7 text-ink/75">
                Delivering trusted, cryptographically verifiable sports data for
                the next generation of applications.
              </p>
            </div>
          </aside>
        </section>

        <footer className="mt-14 border-t-4 border-double border-ink pt-3 flex justify-between uppercase text-[10px] tracking-[0.25em] font-press text-ink-soft">
          <span>© 2026 TXALPA</span>
          <span>Built for Superteam Solana</span>
        </footer>
      </div>
    </main>
  );
}
