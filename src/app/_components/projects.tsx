"use client";

import React from "react";
import InfiniteScroll from "@/components/ui/infinite-scroll";
import { Loader2 } from "lucide-react";
import { ProjectCard } from "@/components/project-card";
import { api } from "@/trpc/react";

const Projects = () => {
  const [latestProjects, latestProjectsQuery] =
    api.project.infiniteProjects.useSuspenseInfiniteQuery(
      {
        limit: 5,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  const { hasNextPage, isFetching, isFetchingNextPage, fetchNextPage } =
    latestProjectsQuery;

  return (
    <div className="hidden-scrollbar max-h-[calc(100vh_-_14.5rem)] w-full overflow-y-auto">
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
  );
};

export default Projects;
