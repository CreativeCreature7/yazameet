"use client";

import { useEffect, useState } from "react";

export const useIsTruncated = (element: HTMLParagraphElement) => {
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    if (element) {
      setIsTruncated(
        element.scrollHeight > element.clientHeight ||
          element.scrollWidth > element.clientWidth,
      );
    }
  }, [element]);

  return isTruncated;
};
