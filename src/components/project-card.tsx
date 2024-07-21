"use client";

import React from "react";
import { useId } from "react";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import { people } from "@/lib/dummy-data";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Project } from "@prisma/client";
import { useTranslations } from "next-intl";

export function ProjectCard({
  id,
  name,
  description,
  rolesNeeded,
  collaborators,
}: Partial<Project>) {
  const t = useTranslations();

  return (
    <Link
      key={id}
      href={`/projects/${id}`}
      className="relative w-full overflow-hidden rounded-3xl rounded-br-none bg-gradient-to-b from-neutral-100 to-white p-6 dark:from-neutral-900 dark:to-neutral-950"
    >
      <Grid size={20} />
      <h2 className="relative z-20 truncate text-2xl font-bold text-neutral-800 dark:text-white">
        {name}
      </h2>
      <div>
        {rolesNeeded?.map((role) => (
          <Badge key={role} className="mb-2 me-2 last:me-0">
            {t(role)}
          </Badge>
        ))}
      </div>
      <p className="relative z-20 mb-4 line-clamp-3 text-base font-normal text-neutral-600 dark:text-neutral-400">
        {description}
      </p>
      <div className="flex flex-row justify-between">
        <div className="flex flex-row">
          <AnimatedTooltip
            items={people}
            size="sm"
            plusButton={true}
            onPlusClick={() => console.log("click")}
          />
        </div>
      </div>
    </Link>
  );
}

export const Grid = ({
  pattern,
  size,
}: {
  pattern?: number[][];
  size?: number;
}) => {
  const p = pattern ?? [
    [Math.floor(Math.random() * 22) + 7, Math.floor(Math.random() * 3) + 1],
    [Math.floor(Math.random() * 22) + 7, Math.floor(Math.random() * 3) + 1],
    [Math.floor(Math.random() * 22) + 7, Math.floor(Math.random() * 3) + 1],
    [Math.floor(Math.random() * 22) + 7, Math.floor(Math.random() * 3) + 1],
    [Math.floor(Math.random() * 22) + 7, Math.floor(Math.random() * 3) + 1],
  ];
  return (
    <div className="pointer-events-none absolute top-0 -ml-20 -mt-2 h-full w-full [mask-image:linear-gradient(white,transparent)] ltr:left-44 rtl:right-44">
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-100/30 to-zinc-300/30 opacity-100 [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] dark:from-zinc-900/30 dark:to-zinc-900/30">
        <GridPattern
          width={size ?? 20}
          height={size ?? 20}
          x="-12"
          y="4"
          squares={p}
          className="absolute inset-0 h-full w-full fill-black/10 stroke-black/10 mix-blend-overlay dark:fill-white/10 dark:stroke-white/10"
        />
      </div>
    </div>
  );
};

export function GridPattern({ width, height, x, y, squares, ...props }: any) {
  const patternId = useId();

  return (
    <svg aria-hidden="true" {...props}>
      <defs>
        <pattern
          id={patternId}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path d={`M.5 ${height}V.5H${width}`} fill="none" />
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        strokeWidth={0}
        fill={`url(#${patternId})`}
      />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([x, y]: any) => (
            <rect
              strokeWidth="0"
              key={`${x}-${y}`}
              width={width + 1}
              height={height + 1}
              x={x * width}
              y={y * height}
            />
          ))}
        </svg>
      )}
    </svg>
  );
}
