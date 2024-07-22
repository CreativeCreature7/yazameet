"use client";

import { api } from "@/trpc/react";
import React from "react";

const Project = ({ id }: { id: number }) => {
  const [project, projectQuery] = api.project.getProject.useSuspenseQuery({
    id,
  });

  return (
    <div>
      {project?.id} - {project?.name}
    </div>
  );
};

export default Project;
