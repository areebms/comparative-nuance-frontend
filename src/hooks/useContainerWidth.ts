import { RefObject, useEffect, useState } from "react";

/**
 * Track an element's width via ResizeObserver.
 *
 * Returns the current width in pixels. Re-renders the consuming
 * component when the element resizes (e.g. browser window resize,
 * sidebar collapse, etc.). Before the observer has fired, returns
 * the fallback width.
 *
 * @example
 *   const ref = useRef<HTMLDivElement>(null);
 *   const width = useContainerWidth(ref, 900);
 *   return <div ref={ref}>{width}px</div>;
 */
export default function useContainerWidth(
  ref: RefObject<HTMLElement | null>,
  fallbackWidth: number,
): number {
  const [width, setWidth] = useState(fallbackWidth);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });
    observer.observe(element);

    return () => observer.disconnect();
  }, [ref]);

  return width;
}
