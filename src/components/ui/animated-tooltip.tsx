"use client";
import Image from "next/image";
import React, { useState } from "react";
import {
  motion,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Clock, PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const tooltipVariants = cva(
  "relative !m-0 rounded-full border-2 border-white object-cover object-top !p-0 transition duration-500 group-hover:z-30 group-hover:scale-105",
  {
    variants: {
      size: {
        sm: "h-10 w-10",
        default: "h-14 w-14",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

type Props = {
  items: {
    id: string;
    name: string | null;
    year: string | null;
    image: string | null;
  }[];
  size?: "default" | "sm";
  onPlusClick?: () => void;
  shouldShowPlusClick?: boolean;
  pendingRequest?: boolean;
};

export const AnimatedTooltip = ({
  items,
  size,
  onPlusClick,
  shouldShowPlusClick,
  pendingRequest,
}: Props) => {
  const session = useSession();
  const t = useTranslations();
  const [hoveredIndex, setHoveredIndex] = useState<string | null>(null);
  const springConfig = { stiffness: 100, damping: 5 };
  const x = useMotionValue(0); // going to set this value on mouse move
  // rotate the tooltip
  const rotate = useSpring(
    useTransform(x, [-100, 100], [-45, 45]),
    springConfig,
  );
  // translate the tooltip
  const translateX = useSpring(
    useTransform(x, [-100, 100], [-50, 50]),
    springConfig,
  );
  const handleMouseMove = (event: any) => {
    const halfWidth = event.target.offsetWidth / 2;
    x.set(event.nativeEvent.offsetX - halfWidth); // set the x value, which is then used in transform and rotate
  };

  return (
    <>
      {items.map((item, idx) => (
        <div
          className="group relative -me-4"
          key={item.name}
          onMouseEnter={() => setHoveredIndex(item.id)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence mode="popLayout">
            {hoveredIndex === item.id && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.6 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 260,
                    damping: 10,
                  },
                }}
                exit={{ opacity: 0, y: 20, scale: 0.6 }}
                style={{
                  translateX: translateX,
                  rotate: rotate,
                  whiteSpace: "nowrap",
                }}
                className="absolute -left-1/2 -top-16 z-50 flex translate-x-1/2 flex-col items-center justify-center rounded-md bg-white px-4 py-2 text-xs shadow-xl"
              >
                <div className="absolute inset-x-10 -bottom-px z-30 h-px w-[20%] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
                <div className="absolute -bottom-px left-10 z-30 h-px w-[40%] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
                {session.data?.user ? (
                  <Link href={`/profile/${item.id}`}>
                    <div className="relative z-30 text-base font-bold text-black hover:underline">
                      {item.name}
                    </div>
                  </Link>
                ) : (
                  <div className="relative z-30 text-base font-bold text-black">
                    {item.name}
                  </div>
                )}
                <div className="text-xs text-black">{t(item.year)}</div>
              </motion.div>
            )}
          </AnimatePresence>
          {item.image ? (
            <Image
              onMouseMove={handleMouseMove}
              height={100}
              width={100}
              src={item.image}
              alt={item.name ?? ""}
              className={cn(tooltipVariants({ size }))}
            />
          ) : (
            <Avatar
              onMouseMove={handleMouseMove}
              className={cn(tooltipVariants({ size }))}
            >
              <AvatarFallback>
                {item.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      ))}
      {shouldShowPlusClick && onPlusClick && (
        <Button
          variant="ghost"
          className={`${cn(tooltipVariants({ size }))} bg-accent hover:border-white hover:bg-primary hover:text-white`}
          onClick={(e) => {
            e.preventDefault();
            onPlusClick();
          }}
        >
          <PlusIcon className={cn(size)} />
        </Button>
      )}
      {pendingRequest && (
        <div className={`${cn(tooltipVariants({ size }))} bg-accent`}>
          <div className="flex h-full w-full animate-pulse items-center justify-center">
            <Clock className={cn(size)} />
          </div>
        </div>
      )}
    </>
  );
};
