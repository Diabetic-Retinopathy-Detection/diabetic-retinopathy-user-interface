import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";

import { getAnnotationColor } from "@/lib/annotations/colors";
import type { Annotation } from "@/types/annotation";
import styles from "./AnnotationCanvas.module.css";

type AnnotationCanvasProps = {
  className?: string;
  file: File;
  previewUrl: string;
  annotations: Annotation[];
  hoveredAnnotationId?: string;
  onAnnotationCreated: (annotation: Annotation) => void;
  onAnnotationHover: (annotationId?: string) => void;
  onReset: () => void;
};

type Point = {
  x: number;
  y: number;
};

type ImageBounds = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type DrawingState = {
  pointerId: number;
  start: Point;
  current: Point;
};

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function getImageBounds(
  frame: HTMLDivElement,
  image: HTMLImageElement,
): ImageBounds {
  const frameWidth = frame.clientWidth;
  const frameHeight = frame.clientHeight;
  const imageRatio = image.naturalWidth / image.naturalHeight || 1;
  const frameRatio = frameWidth / frameHeight;

  if (imageRatio > frameRatio) {
    const width = frameWidth;
    const height = width / imageRatio;
    return { left: 0, top: (frameHeight - height) / 2, width, height };
  }

  const height = frameHeight;
  const width = height * imageRatio;
  return { left: (frameWidth - width) / 2, top: 0, width, height };
}

function getPoint(
  event: React.PointerEvent<SVGSVGElement>,
  frame: HTMLDivElement,
  imageBounds: ImageBounds,
): Point {
  const frameRect = frame.getBoundingClientRect();
  const bounds = {
    left: imageBounds.left * frameRect.width,
    top: imageBounds.top * frameRect.height,
    width: imageBounds.width * frameRect.width,
    height: imageBounds.height * frameRect.height,
  };
  return {
    x: clamp((event.clientX - frameRect.left - bounds.left) / bounds.width),
    y: clamp((event.clientY - frameRect.top - bounds.top) / bounds.height),
  };
}

function getRectangle(start: Point, end: Point): Annotation {
  return {
    id: crypto.randomUUID(),
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y),
    text: "",
  };
}

export default function AnnotationCanvas({
  className,
  file,
  previewUrl,
  annotations,
  hoveredAnnotationId,
  onAnnotationCreated,
  onAnnotationHover,
  onReset,
}: AnnotationCanvasProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [drawing, setDrawing] = useState<DrawingState>();
  const [imageBounds, setImageBounds] = useState<ImageBounds>({
    left: 0,
    top: 0,
    width: 1,
    height: 1,
  });

  function measureImageBounds() {
    const frame = frameRef.current;
    const image = imageRef.current;
    if (!frame || !image || !image.naturalWidth || !image.naturalHeight) return;

    const bounds = getImageBounds(frame, image);
    setImageBounds({
      left: bounds.left / frame.clientWidth,
      top: bounds.top / frame.clientHeight,
      width: bounds.width / frame.clientWidth,
      height: bounds.height / frame.clientHeight,
    });
  }

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const observer = new ResizeObserver(measureImageBounds);
    observer.observe(frame);
    measureImageBounds();

    return () => observer.disconnect();
  }, [previewUrl]);

  function getCurrentPoint(event: React.PointerEvent<SVGSVGElement>) {
    const frame = frameRef.current;
    if (!frame) return;
    return getPoint(event, frame, imageBounds);
  }

  function finishDrawing(event: React.PointerEvent<SVGSVGElement>) {
    if (!drawing) return;

    const end = getCurrentPoint(event) ?? drawing.current;
    const rectangle = getRectangle(drawing.start, end);
    setDrawing(undefined);

    if (rectangle.width < 0.01 || rectangle.height < 0.01) return;
    onAnnotationCreated(rectangle);
  }

  function renderRectangle(annotation: Annotation, index: number) {
    const x = imageBounds.left + annotation.x * imageBounds.width;
    const y = imageBounds.top + annotation.y * imageBounds.height;
    const width = annotation.width * imageBounds.width;
    const height = annotation.height * imageBounds.height;
    const isHovered = hoveredAnnotationId === annotation.id;
    const color = getAnnotationColor(index);

    return (
      <g
        key={annotation.id}
        data-annotation-id={annotation.id}
        data-annotation-target="canvas"
        className={isHovered ? styles.hovered : ""}
        style={{ "--annotation-color": color } as CSSProperties}
        onPointerEnter={() => onAnnotationHover(annotation.id)}
        onPointerLeave={() => onAnnotationHover(undefined)}
      >
        <rect
          className={styles.annotation}
          x={x}
          y={y}
          width={width}
          height={height}
        />
        <text className={styles.label} x={x + 1} y={y + 4}>
          {index + 1}
        </text>
      </g>
    );
  }

  function renderAnchor(annotation: Annotation) {
    const left =
      (imageBounds.left + (annotation.x + annotation.width / 2) * imageBounds.width) * 100;
    const top =
      (imageBounds.top + (annotation.y + annotation.height / 2) * imageBounds.height) * 100;

    return (
      <span
        key={annotation.id}
        className={styles.anchor}
        data-annotation-id={annotation.id}
        data-annotation-target="canvas-anchor"
        style={{ left: `${left}%`, top: `${top}%` }}
      />
    );
  }

  const previewRectangle = drawing
    ? getRectangle(drawing.start, drawing.current)
    : undefined;

  return (
    <section className={`${styles.wrapper} ${className ?? ""}`} aria-label="Selected image">
      <div ref={frameRef} className={styles.imageFrame}>
        <Image
          ref={imageRef}
          className={styles.image}
          src={previewUrl}
          alt={`Selected fundus image: ${file.name}`}
          fill
          sizes="(max-width: 700px) 100vw, 640px"
          unoptimized
          draggable={false}
          onLoad={measureImageBounds}
        />
        <svg
          className={styles.overlay}
          viewBox="0 0 1 1"
          preserveAspectRatio="none"
          onPointerDown={(event) => {
            const point = getCurrentPoint(event);
            if (!point) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            setDrawing({ pointerId: event.pointerId, start: point, current: point });
          }}
          onPointerMove={(event) => {
            if (!drawing || event.pointerId !== drawing.pointerId) return;
            const point = getCurrentPoint(event);
            if (point) setDrawing({ ...drawing, current: point });
          }}
          onPointerUp={finishDrawing}
          onPointerCancel={() => setDrawing(undefined)}
          aria-label="Draw a rectangular region of interest"
        >
          {annotations.map(renderRectangle)}
          {previewRectangle && renderRectangle(previewRectangle, annotations.length)}
        </svg>
        <div className={styles.anchors} aria-hidden="true">
          {annotations.map(renderAnchor)}
        </div>
      </div>
      <div className={styles.details}>
        <div>
          <p className={styles.name}>{file.name}</p>
          <p className={styles.meta}>
            {annotations.length} region{annotations.length === 1 ? "" : "s"} marked
          </p>
        </div>
        <button className={styles.reset} type="button" onClick={onReset}>
          Choose another
        </button>
      </div>
    </section>
  );
}
