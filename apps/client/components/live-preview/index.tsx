/**
 * Live preview component that renders HTML in a lightweight iframe.
 * Features:
 * - Real-time preview updates
 * - Tailwind CSS support
 * - Theme-aware rendering
 * - Pre-installed CDN libraries cached by the browser
 *
 * By Dulapah Vibulsanti (https://dulapahv.dev)
 */
import { MonitorPlay, Sparkles } from "lucide-react";
import { DISABLE_TAILWIND_CDN_WARN, PREVIEW_CDN } from "@/lib/constants";
import { HelpPopover } from "./components/help-popover";

interface LivePreviewProps {
  value: string;
}

const LivePreview = ({ value }: LivePreviewProps) => {
  const srcdoc = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${DISABLE_TAILWIND_CDN_WARN}${PREVIEW_CDN}</head><body class="h-screen">${value}</body></html>`;

  return (
    <div className="relative size-full overflow-hidden bg-[#fff7ed]">
      {value.trim() ? (
        <iframe
          className="size-full border-none"
          sandbox="allow-scripts allow-same-origin"
          srcDoc={srcdoc}
          title="Live Preview"
        />
      ) : (
        <section
          aria-label="Live preview is ready"
          className="flex size-full items-center justify-center bg-[radial-gradient(ellipse_at_50%_42%,#fff7ed_0%,#ffedd5_50%,#fed7aa_100%)] p-6"
        >
          <div className="flex max-w-xs flex-col items-center text-center">
            <div className="relative mb-5">
              <div className="absolute -inset-3 rounded-[2rem] bg-orange-400/20 blur-xl" />
              <div className="relative flex size-16 items-center justify-center rounded-2xl border border-orange-300/70 bg-white/70 text-orange-700 shadow-[0_12px_35px_-16px_rgba(194,65,12,0.5)]">
                <MonitorPlay aria-hidden="true" className="size-8" />
              </div>
              <span className="absolute -right-2 -bottom-2 flex size-7 items-center justify-center rounded-full border-2 border-[#fff7ed] bg-orange-500 text-white shadow-md">
                <Sparkles aria-hidden="true" className="size-3.5" />
              </span>
            </div>
            <span className="mb-2 rounded-full border border-orange-700/10 bg-white/60 px-2.5 py-1 font-semibold text-[10px] text-orange-800 uppercase tracking-[0.16em]">
              Live preview
            </span>
            <h2 className="font-semibold text-lg text-orange-950 tracking-tight">
              Your canvas is ready
            </h2>
            <p className="mt-1.5 text-orange-900/65 text-sm leading-relaxed">
              Start writing code and your creation will appear here instantly.
            </p>
          </div>
        </section>
      )}
      <div className="absolute right-2 bottom-2 z-10">
        <HelpPopover />
      </div>
    </div>
  );
};

export { LivePreview };
