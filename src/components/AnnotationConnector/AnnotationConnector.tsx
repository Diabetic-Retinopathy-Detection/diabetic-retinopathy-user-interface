import { useEffect, useState, type RefObject } from "react";

import styles from "./AnnotationConnector.module.css";

type AnnotationConnectorProps = {
  annotationId?: string;
  color: string;
  containerRef: RefObject<HTMLElement | null>;
};

type ConnectorLine = {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  width: number;
  height: number;
};

function getTarget(
  container: HTMLElement,
  annotationId: string,
  target: "canvas-anchor" | "list",
) {
  return Array.from(container.querySelectorAll("[data-annotation-id]")).find(
    (element) =>
      element.getAttribute("data-annotation-id") === annotationId &&
      element.getAttribute("data-annotation-target") === target,
  );
}

function getConnectorLine(
  container: HTMLElement,
  annotationId: string,
): ConnectorLine | undefined {
  const canvasTarget = getTarget(container, annotationId, "canvas-anchor");
  const listTarget = getTarget(container, annotationId, "list");
  if (!canvasTarget || !listTarget) return;

  const containerRect = container.getBoundingClientRect();
  const canvasRect = canvasTarget.getBoundingClientRect();
  const listRect = listTarget.getBoundingClientRect();

  let startX = canvasRect.left + canvasRect.width / 2;
  let startY = canvasRect.top + canvasRect.height / 2;
  let endX = listRect.left;
  let endY = listRect.top + listRect.height / 2;

  if (listRect.right < canvasRect.left) {
    startX = canvasRect.left + canvasRect.width / 2;
    endX = listRect.right;
  } else if (listRect.top > canvasRect.bottom) {
    startX = canvasRect.left + canvasRect.width / 2;
    startY = canvasRect.bottom;
    endX = listRect.left + listRect.width / 2;
    endY = listRect.top;
  } else if (listRect.bottom < canvasRect.top) {
    startX = canvasRect.left + canvasRect.width / 2;
    startY = canvasRect.top;
    endX = listRect.left + listRect.width / 2;
    endY = listRect.bottom;
  }

  const clamp = (value: number, maximum: number) =>
    Math.min(Math.max(value, 0), maximum);

  return {
    startX: clamp(startX - containerRect.left, containerRect.width),
    startY: clamp(startY - containerRect.top, containerRect.height),
    endX: clamp(endX - containerRect.left, containerRect.width),
    endY: clamp(endY - containerRect.top, containerRect.height),
    width: containerRect.width,
    height: containerRect.height,
  };
}

export default function AnnotationConnector({
  annotationId,
  color,
  containerRef,
}: AnnotationConnectorProps) {
  const [line, setLine] = useState<ConnectorLine>();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !annotationId) {
      setLine(undefined);
      return;
    }
    const root = container;
    const id = annotationId;

    function updateLine() {
      setLine(getConnectorLine(root, id));
    }

    const observer = new ResizeObserver(updateLine);
    observer.observe(root);
    updateLine();
    window.addEventListener("resize", updateLine);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateLine);
    };
  }, [annotationId, containerRef]);

  if (!line) return null;

  return (
    <svg
      className={styles.connector}
      viewBox={`0 0 ${line.width} ${line.height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <line
        x1={line.startX}
        y1={line.startY}
        x2={line.endX}
        y2={line.endY}
        stroke={color}
      />
    </svg>
  );
}
