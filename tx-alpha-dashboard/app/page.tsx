import { Masthead } from "@/components/masthead";
import { HeroStory } from "@/components/hero-story";
import { Lock, Zap, Radio } from "lucide-react";

export default function Home() {
  return (
    <main className="bg-newsprint text-ink font-body">
      <div className="max-w-6xl mx-auto px-6 md:px-8 ">
        <Masthead />
        <HeroStory />
      </div>

      <footer className=" border-ink bg-newsprint mt-8">
        <div className="max-w-6xl border-t-2 mx-auto ">
          <p className="font-press uppercase tracking-[0.2em] text-[10px] py-1 px-2">
            &copy; 2026 TXALPA. Built for Superteam Solana.
          </p>
        </div>
      </footer>
    </main>
  );
}
