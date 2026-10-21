/**
 * Home page component that displays the landing page with:
 * - Room access form
 * - Animated background
 * - Feature showcase grid
 * - Latency test button
 * - Server status indicator
 *
 * By Dulapah Vibulsanti (https://dulapahv.dev)
 */

import { ArrowUpRight, Sparkles } from "lucide-react";
import Image from "next/image";
import { Suspense } from "react";

import { AnimatedGridBackground } from "@/components/animated-grid-bg";
import { LatencyTestButton } from "@/components/latency-test-button";
import { RoomAccessForm } from "@/components/room-access-form";
import { ShowcaseGrid } from "@/components/showcase-grid";

export default async function Page({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const roomId = params.room?.toString() || "";

  return (
    <>
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 bg-[#111623]"
        role="presentation"
      />
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_12%_18%,rgba(249,115,22,0.28),transparent_38%),radial-gradient(ellipse_at_88%_82%,rgba(194,65,12,0.24),transparent_42%)]"
        role="presentation"
      />
      <div className="dark fixed inset-0 -z-10">
        <AnimatedGridBackground />
      </div>
      <main className="dark relative flex min-h-full w-full flex-col overflow-hidden min-[1189px]:flex-row">
        {/* Left Section - Form */}
        <div className="my-2 flex min-h-[700px] w-full flex-col justify-center p-4 min-[1189px]:w-5/12 min-[1189px]:items-center min-[560px]:p-8 min-[1189px]:pl-12">
          <div className="w-full max-w-xl">
            <div className="mb-8 space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-300/20 bg-orange-400/10 px-3 py-1.5 font-medium text-orange-200 text-xs shadow-[0_0_28px_rgba(249,115,22,0.12)]">
                <Sparkles aria-hidden="true" className="size-3.5" />
                COLLABORATIVE CODING, REIMAGINED
              </div>
              <h1 className="flex flex-row items-start gap-2 font-bold text-4xl text-foreground tracking-tight sm:text-5xl">
                <Image
                  alt="CodeX Logo"
                  className="size-16 drop-shadow-[0_8px_24px_rgba(249,115,22,0.18)] sm:size-20 min-[1189px]:size-24"
                  fetchPriority="high"
                  height={96}
                  loading="eager"
                  src="/images/codex-logo.svg"
                  width={96}
                />
                <div className="flex flex-col items-start text-start">
                  <span>Code together</span>
                  <span className="flex items-end gap-2 min-[1189px]:items-baseline">
                    <span>now on</span>
                    <span className="bg-gradient-to-r from-amber-300 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]">
                      CodeX
                    </span>
                  </span>
                </div>
              </h1>
              <p className="w-full max-w-lg whitespace-pre-line text-base text-foreground/70 leading-relaxed sm:w-[93%] sm:text-lg">
                Your collaborative coding space, reimagined. Start now, no
                sign-up required.
              </p>
            </div>

            <Suspense fallback={null}>
              <RoomAccessForm roomId={roomId} />
            </Suspense>
          </div>
        </div>

        {/* Right Section - Showcase Grid */}
        <div className="dark relative flex w-full max-w-5xl flex-1 items-center justify-center min-[1189px]:w-7/12 min-[1189px]:pr-8">
          <ShowcaseGrid />
        </div>

        <div className="dark fixed right-3 bottom-2.5 z-20 flex items-center gap-x-3 rounded-full border border-white/10 bg-[#111623]/80 px-3 py-1.5 shadow-lg backdrop-blur-md">
          <span className="hidden items-center gap-1.5 text-muted-foreground text-xs sm:flex">
            Check your connection
            <ArrowUpRight aria-hidden="true" className="size-3" />
          </span>
          <LatencyTestButton />
        </div>
      </main>
    </>
  );
}
