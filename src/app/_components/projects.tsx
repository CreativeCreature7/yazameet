"use client";

import React, { useState } from "react";
import InfiniteScroll from "@/components/ui/infinite-scroll";
import { Loader2, Search } from "lucide-react";
import { ProjectCard } from "@/components/project-card";
import { api } from "@/trpc/react";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { useDebounce } from "@/hooks/use-debounce";
import { Option } from "@/components/ui/multi-select";
import { ProjectType, Roles } from "@prisma/client";
import { FilterDialog } from "@/app/_components/filter-dialog";

const Projects = () => {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<Option[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Option[]>([]);
  const debouncedSearch = useDebounce(searchQuery, 700);

  const [latestProjects, latestProjectsQuery] =
    api.project.infiniteProjects.useSuspenseInfiniteQuery(
      {
        limit: 5,
        query: debouncedSearch,
        types: selectedTypes.map((type) => type.value as ProjectType),
        roles: selectedRoles.map((role) => role.value as Roles),
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  const { hasNextPage, isFetching, isFetchingNextPage, fetchNextPage } =
    latestProjectsQuery;

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground rtl:right-3" />
          <Input
            placeholder={t("search_projects")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rtl:pr-9"
          />

          <FilterDialog
            selectedTypes={selectedTypes}
            setSelectedTypes={setSelectedTypes}
            selectedRoles={selectedRoles}
            setSelectedRoles={setSelectedRoles}
          />
        </div>
      </div>
      <div className="hidden-scrollbar max-h-[calc(100vh_-_14rem)] w-full overflow-y-auto md:max-h-[calc(100vh_-_19rem)]">
        <div className="flex w-full flex-col items-center gap-3">
          {latestProjects?.pages.map((group, i) => (
            <React.Fragment key={i}>
              {group.items.map((project) => (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  description={project.description}
                  name={project.name}
                  rolesNeeded={project.rolesNeeded}
                  type={project.type}
                  collaborators={project.collaborators}
                />
              ))}
            </React.Fragment>
          ))}
          <InfiniteScroll
            hasMore={hasNextPage}
            isLoading={isFetching || isFetchingNextPage}
            next={fetchNextPage}
            threshold={1}
          >
            {hasNextPage && (
              <Loader2 className="my-4 h-8 w-8 animate-spin text-primary" />
            )}
          </InfiniteScroll>
        </div>
      </div>
    </div>
  );
};

export default Projects;
