"use client";

import { useState } from "react";
import { ShieldCheck, X } from "lucide-react";

interface CommentaryEntry {
  text: string;
  ts: number;
}

interface CommentaryFeedProps {
  fixtureId: number;
  commentaryFeed: CommentaryEntry[];
}

export function CommentaryFeed({
  fixtureId,
  commentaryFeed,
}: CommentaryFeedProps) {
  const [validation, setValidation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bytesToHex = (bytes: number[]) =>
    bytes.map((b) => b.toString(16).padStart(2, "0")).join("");

  const handleVerify = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `http://localhost:8080/api/validation?fixture_id=${fixtureId}`,
      );

      const text = await res.text();

      if (!res.ok) {
        throw new Error(text);
      }

      setValidation(JSON.parse(text));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const latestEntries = [...commentaryFeed]
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 15);

  return (
    <>
      <div className="max-h-[520px] overflow-y-auto border-l border-ink bg-newsprint p-4 commentary-scroll">
        <div className="mb-4 flex items-center justify-between border-b border-ink pb-3">
          <div>
            <h2 className="font-headline text-xl">Commentary</h2>
          </div>

          <button
            onClick={handleVerify}
            disabled={loading}
            className="flex items-center gap-2 border border-ink px-2 py-1.5 transition hover:bg-ink hover:text-newsprint disabled:opacity-50"
          >
            <ShieldCheck className="h-3.5 w-3.5" />

            <span className="font-press text-[10px] uppercase tracking-[0.25em]">
              {loading ? "Verifying..." : "Verify Feed"}
            </span>
          </button>
        </div>

        {latestEntries.length === 0 ? (
          <p className="py-8 text-center font-body text-sm text-ink-soft">
            No commentary available.
          </p>
        ) : (
          <div className="space-y-4">
            {latestEntries.map((entry, index) => (
              <div
                key={`${entry.ts}-${index}`}
                className="border-b border-dashed border-ink/30 pb-3 last:border-0"
              >
                <div className="mb-2">
                  <span className="font-press text-[10px] uppercase tracking-[0.3em] text-ink-soft">
                    {new Date(entry.ts).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                </div>

                <p className="font-body text-sm leading-6 text-ink">
                  {entry.text}
                </p>
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="mt-4 border border-red-300 bg-red-50 p-2 text-xs text-red-700">
            {error}
          </p>
        )}
      </div>

      {validation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setValidation(null)}
        >
          <div
            className="w-full max-w-lg border-2 border-ink bg-newsprint"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b-2 border-ink px-5 py-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-700" />

                <div>
                  <h3 className="font-headline text-xl">Verification Record</h3>

                  <p className="font-press text-[10px] uppercase tracking-[0.25em] text-ink-soft">
                    Cryptographic Proof
                  </p>
                </div>
              </div>

              <button
                onClick={() => setValidation(null)}
                className="border border-ink p-1 hover:bg-ink hover:text-newsprint"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5 p-5 text-sm">
              <div className="flex items-center gap-2 border border-green-700 bg-green-50 px-3 py-2 text-green-700">
                <ShieldCheck className="h-4 w-4" />
                <span className="font-semibold">Successfully Verified</span>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-dashed border-ink pb-4">
                <div>
                  <p className="font-press text-[10px] uppercase tracking-widest text-ink-soft">
                    Competition
                  </p>

                  <p className="mt-1 font-medium">
                    {validation.summary.competition}
                  </p>
                </div>

                <div>
                  <p className="font-press text-[10px] uppercase tracking-widest text-ink-soft">
                    Updates
                  </p>

                  <p className="mt-1 font-medium">
                    {validation.summary.updateStats.updateCount}
                  </p>
                </div>
              </div>

              <div>
                <p className="font-press text-[10px] uppercase tracking-widest text-ink-soft">
                  Merkle Root
                </p>

                <p className="mt-2 break-all rounded border border-ink/20 bg-white/40 p-2 font-mono text-[11px] leading-5">
                  {bytesToHex(validation.summary.updateSubTreeRoot)}
                </p>
              </div>

              <div>
                <p className="font-press text-[10px] uppercase tracking-widest text-ink-soft">
                  Main Proof Chain
                </p>

                <div className="mt-2 max-h-48 space-y-2 overflow-y-auto border-l commentary-scroll border-ink rounded border border-ink/20 bg-white/40 p-2">
                  {validation.mainTreeProof.map((node: any, index: number) => (
                    <div
                      key={index}
                      className="border-b border-dashed border-ink/20 pb-2 last:border-0"
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <span className="font-press text-[10px] uppercase tracking-widest text-ink-soft">
                          Node {index + 1}
                        </span>

                        <span className="font-press text-[10px]">
                          {node.isRightSibling ? "Right" : "Left"}
                        </span>
                      </div>

                      <p className="break-all font-mono text-[10px] leading-5">
                        {bytesToHex(node.hash)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
