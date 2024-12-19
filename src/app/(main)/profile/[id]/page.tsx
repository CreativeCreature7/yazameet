"use client";

import { api } from "@/trpc/react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Mail, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage({ params }: { params: { id: string } }) {
  const t = useTranslations();
  const { data: profile, isLoading } = api.profile.getPublicProfile.useQuery({
    id: params.id,
  });

  if (isLoading) return <ProfileSkeleton />;
  if (!profile) return <div>Profile not found</div>;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-white p-4 shadow-xl dark:bg-black sm:p-8"
        >
          <div className="relative mb-6 flex flex-col items-center gap-4 sm:mb-8 sm:flex-row sm:gap-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative h-24 w-24 overflow-hidden rounded-full sm:h-32 sm:w-32"
            >
              <Avatar className="h-full w-full">
                <AvatarImage
                  src={profile.image ?? ""}
                  alt={profile.name ?? ""}
                  className="object-cover"
                />
                <AvatarFallback>
                  {profile.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </motion.div>

            <div className="text-center sm:text-start">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold sm:text-4xl"
              >
                {profile.name}
              </motion.h1>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-2 flex flex-col items-center gap-2 text-muted-foreground sm:flex-row sm:gap-4"
              >
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm sm:text-base">{profile.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  <span className="text-sm sm:text-base">
                    {t(profile.year ?? "FIRSTYEAR")}
                  </span>
                </div>
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center sm:items-start"
          >
            <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
              {profile.roles.map((role, index) => (
                <motion.div
                  key={role}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <Badge variant="secondary" className="text-sm">
                    {t(role)}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="rounded-3xl bg-white p-4 shadow-xl dark:bg-black sm:p-8">
          <div className="relative mb-6 flex flex-col items-center gap-4 sm:mb-8 sm:flex-row sm:gap-8">
            <Skeleton className="h-24 w-24 rounded-full sm:h-32 sm:w-32" />
            <div className="flex flex-col items-center gap-2 sm:items-start">
              <Skeleton className="h-8 w-48 sm:w-64" />
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}
