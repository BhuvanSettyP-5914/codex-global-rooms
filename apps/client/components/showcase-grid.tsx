/**
 * Showcase grid component for displaying feature highlights.
 * Features:
 * - Image grid layout
 * - Feature descriptions
 * - Icon integration
 *
 * By Dulapah Vibulsanti (https://dulapahv.dev)
 */

import {
  Code2,
  GitPullRequestCreateArrow,
  LayoutTemplate,
  NotebookPen,
  Terminal,
  Video,
} from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

interface ShowcaseImage {
  alt: string;
  description: string;
  icon: ReactNode;
  src: string;
  title: string;
}

const showcaseImages: ShowcaseImage[] = [
  {
    src: "/images/showcase/collaborate.png",
    alt: "Real-time collaboration",
    title: "Real-time Collaboration",
    description:
      "Code together in real-time with cursor sharing, highlighting, and follow mode",
    icon: <Code2 className="size-4" />,
  },
  {
    src: "/images/showcase/terminal.png",
    alt: "Shared terminal",
    title: "Shared Terminal",
    description:
      "Execute code and see results together with html",
    icon: <Terminal className="size-4" />,
  },
  {
    src: "/images/showcase/live-preview.png",
    alt: "Live preview",
    title: "Live Preview",
    description:
      "Preview UI changes instantly with loaded libraries like Tailwind CSS, and more",
    icon: <LayoutTemplate className="size-4" />,
  },
  {
    src: "/images/showcase/github.png",
    alt: "GitHub integrated",
    title: "GitHub Integrated",
    description: "Save your work and open files from your repositories",
    icon: <GitPullRequestCreateArrow className="size-4" />,
  },
  {
    src: "/images/showcase/notepad.png",
    alt: "Shared notepad",
    title: "Shared Notepad",
    description:
      "Take notes together in real-time with rich text and markdown support",
    icon: <NotebookPen className="size-4" />,
  },
  {
    src: "/images/showcase/video.png",
    alt: "Video and voice",
    title: "Video & Voice",
    description: "Communicate with your team using video and voice chat",
    icon: <Video className="size-4" />,
  },
];

const ShowcaseCard = ({ image }: { image: ShowcaseImage }) => (
  <article className="group relative min-h-[300px] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#111623]/65 shadow-[0_16px_48px_-28px_rgba(0,0,0,0.9)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-orange-300/30 hover:shadow-[0_24px_60px_-28px_rgba(249,115,22,0.24)]">
    <div className="relative aspect-video w-full overflow-hidden bg-white/5">
      <Image
        alt={image.alt}
        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        fill
        loading="eager"
        sizes="(min-width: 1189px) 33vw, (min-width: 560px) 50vw, 100vw"
        src={image.src}
      />
    </div>
    <div className="min-h-28 p-4 sm:p-5">
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded-xl border border-orange-300/15 bg-orange-400/10 p-2 text-orange-300 transition-colors group-hover:bg-orange-400/15">
          {image.icon}
        </span>
        <h2 className="font-semibold text-base text-foreground tracking-tight">
          {image.title}
        </h2>
      </div>
      <p className="text-foreground/60 text-sm leading-relaxed">
        {image.description}
      </p>
    </div>
  </article>
);

const ShowcaseGrid = () => (
  <div className="grid w-full auto-rows-max gap-6">
    {/* Mobile: Single column */}
    <div className="grid grid-cols-1 gap-6 p-4 min-[560px]:hidden">
      {showcaseImages.map((image) => (
        <ShowcaseCard image={image} key={image.title} />
      ))}
    </div>

    {/* Tablet: Two columns with stagger */}
    <div className="hidden grid-cols-2 gap-6 p-8 min-[560px]:grid min-[1189px]:hidden">
      <div className="space-y-6">
        {showcaseImages.slice(0, 3).map((image) => (
          <ShowcaseCard image={image} key={image.title} />
        ))}
      </div>
      <div className="mt-12 space-y-6">
        {showcaseImages.slice(3, 6).map((image) => (
          <ShowcaseCard image={image} key={image.title} />
        ))}
      </div>
    </div>

    {/* Desktop: Three columns with stagger */}
    <div className="hidden grid-cols-3 gap-6 min-[1189px]:grid">
      <div className="space-y-6">
        {showcaseImages.slice(0, 2).map((image) => (
          <ShowcaseCard image={image} key={image.title} />
        ))}
      </div>
      <div className="mt-12 space-y-6">
        {showcaseImages.slice(2, 4).map((image) => (
          <ShowcaseCard image={image} key={image.title} />
        ))}
      </div>
      <div className="mt-24 space-y-6">
        {showcaseImages.slice(4, 6).map((image) => (
          <ShowcaseCard image={image} key={image.title} />
        ))}
      </div>
    </div>
  </div>
);

export { ShowcaseGrid };
