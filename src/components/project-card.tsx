"use client";

import React, { useEffect, useRef, useState } from "react";
import { useId } from "react";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import { Badge } from "@/components/ui/badge";
import { Roles, User, ProjectType } from "@prisma/client";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ProjectForm } from "@/app/_components/project-form";
import { ContactRequestDialog } from "@/components/contact-request-dialog";

const colorByType = {
  NONPROFIT: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  FORPROFIT:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  IMPACT:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  UPRISE:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
} as const;

type Props = {
  id: number;
  name: string;
  description: string;
  rolesNeeded: Roles[];
  type: ProjectType[];
  collaborators: User[];
  isOwner: boolean;
};

export function ProjectCard({
  id,
  name,
  description,
  rolesNeeded,
  type,
  collaborators,
  isOwner,
}: Props) {
  const t = useTranslations();
  const [readMore, setReadMore] = useState(false);
  const [ellipsisActive, setEllipsisActive] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement | null>(null);

  const isEllipsisActive = () => {
    return (
      descriptionRef.current &&
      descriptionRef.current.offsetHeight < descriptionRef.current.scrollHeight
    );
  };

  useEffect(() => {
    setEllipsisActive(!!isEllipsisActive());
  }, [descriptionRef.current]);

  const getRoleCount = (role: Roles) => {
    return rolesNeeded.filter((r) => r === role).length;
  };

  const uniqueRoles = Array.from(new Set(rolesNeeded));

  return (
    <div
      key={id}
      className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-b from-neutral-100 to-white p-6 dark:from-neutral-900 dark:to-neutral-950"
    >
      <Grid size={20} />
      <div className="flex flex-col justify-between">
        <div>
          {type?.map((type) => (
            <Badge
              key={type}
              className={`mb-2 me-2 last:me-0 ${colorByType[type]}`}
            >
              {t(type)}
            </Badge>
          ))}
        </div>
        <h2 className="relative z-20 truncate text-2xl font-bold text-neutral-800 dark:text-white">
          {name}
        </h2>
        <div>
          {uniqueRoles.map((role) => {
            const count = getRoleCount(role);
            return (
              <Badge key={role} className="mb-2 me-2 last:me-0">
                {t(role)}{count > 1 ? ` (${count}x)` : ''}
              </Badge>
            );
          })}
        </div>
        <p
          ref={descriptionRef}
          className={`relative z-20 ${ellipsisActive && "mb-0"} ${readMore ? "line-clamp-none" : "line-clamp-3"} text-base font-normal text-neutral-600 dark:text-neutral-400`}
        >
          {description}
        </p>
        {ellipsisActive && !readMore && (
          <Button
            className="p-0"
            variant="linkHover2"
            onClick={() => setReadMore(!readMore)}
          >
            {t("read_more")}
          </Button>
        )}
        <div className="mt-4 flex flex-row justify-between">
          <div className="flex flex-row">
            <AnimatedTooltip items={collaborators} size="sm" />
          </div>
          {isOwner ? (
            <ProjectForm
              id={id}
              values={{
                name,
                description,
                rolesNeeded: rolesNeeded.map((role) => ({
                  label: t(role),
                  value: role,
                })),
                type: type.map((type) => ({
                  label: t(type),
                  value: type,
                })),
              }}
            />
          ) : (
            <ContactRequestDialog projectId={id} roles={rolesNeeded} />
          )}
        </div>
      </div>
    </div>
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
