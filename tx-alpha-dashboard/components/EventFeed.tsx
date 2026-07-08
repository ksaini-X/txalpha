"use client";

import { MatchEvent } from "@/lib/mock-data";
import { Goal, AlertCircle, Circle, Zap, BarChart3 } from "lucide-react";

interface EventFeedProps {
  events: MatchEvent[];
}

export function EventFeed({ events }: EventFeedProps) {
  const getEventIcon = (type: MatchEvent["type"]) => {
    switch (type) {
      case "goal":
        return <Goal className="w-5 h-5 text-green-400" />;
      case "card":
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case "corner":
        return <Circle className="w-5 h-5 text-blue-400" />;
      case "shot":
        return <Zap className="w-5 h-5 text-orange-400" />;
      case "possession":
        return <BarChart3 className="w-5 h-5 text-slate-400" />;
      default:
        return <Circle className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
      {events.map((event, index) => (
        <div
          key={event.id}
          className="p-3 bg-slate-900/50 border border-slate-700/50 rounded-lg animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {/* Event header with icon and text */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">{getEventIcon(event.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-slate-400">
                  {event.minute}'
                </span>
                <span className="text-sm font-sans font-medium text-slate-200 truncate">
                  {event.text}
                </span>
              </div>
              <p className="text-xs text-slate-400 italic leading-relaxed">
                {event.commentary}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Add fade-in animation
const style = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in {
    animation: fadeIn 0.3s ease-out forwards;
  }
`;

if (typeof window !== "undefined") {
  const styleElement = document.createElement("style");
  styleElement.textContent = style;
  document.head.appendChild(styleElement);
}
