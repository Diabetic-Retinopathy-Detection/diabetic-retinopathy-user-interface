import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import { getAnnotationColor } from "@/lib/annotations/colors";
import { GRADES, type GradeValue } from "@/types/grade";
import type { Annotation } from "@/types/annotation";
import styles from "./AnnotationList.module.css";

type AnnotationListProps = {
  className?: string;
  annotations: Annotation[];
  hoveredAnnotationId?: string;
  focusedAnnotationId?: string;
  onTextChange: (id: string, text: string) => void;
  onAnnotationHover: (annotationId?: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  selectedGrade?: GradeValue;
  canSubmit: boolean;
  onGradeChange: (grade: GradeValue) => void;
  onSubmit: () => void;
};

export default function AnnotationList({
  className,
  annotations,
  hoveredAnnotationId,
  focusedAnnotationId,
  onTextChange,
  onAnnotationHover,
  onRemove,
  onClear,
  selectedGrade,
  canSubmit,
  onGradeChange,
  onSubmit,
}: AnnotationListProps) {
  const inputRefs = useRef(new Map<string, HTMLTextAreaElement>());
  const panelRef = useRef<HTMLElement>(null);
  const [lockedHeight, setLockedHeight] = useState<number>();

  useEffect(() => {
    if (!focusedAnnotationId) return;
    const input = inputRefs.current.get(focusedAnnotationId);
    input?.focus();
    input?.scrollIntoView({ block: "nearest" });
  }, [focusedAnnotationId]);

  useLayoutEffect(() => {
    if (annotations.length === 4 && lockedHeight === undefined && panelRef.current) {
      setLockedHeight(panelRef.current.getBoundingClientRect().height);
    }
  }, [annotations.length, lockedHeight]);

  return (
    <aside
      ref={panelRef}
      key={annotations.length >= 3 ? "locked" : "unlocked"}
      className={`${styles.panel} ${annotations.length >= 4 ? styles.scrollable : ""} ${className ?? ""}`}
      style={lockedHeight ? { height: `${lockedHeight}px` } : undefined}
      aria-label="Region annotations"
    >
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>Your observations</p>
          <h2>Describe each region</h2>
        </div>
        <button className={styles.clear} type="button" onClick={onClear}>
          Clear all
        </button>
      </div>
      <div className={styles.items}>
        {annotations.length === 0 && (
          <p className={styles.empty}>Mark a region on the image when you need to describe an observation.</p>
        )}
        {annotations.map((annotation, index) => (
          <div
            className={`${styles.item} ${hoveredAnnotationId === annotation.id ? styles.hovered : ""}`}
            data-annotation-id={annotation.id}
            data-annotation-target="list"
            key={annotation.id}
            style={{ "--annotation-color": getAnnotationColor(index) } as CSSProperties}
            onPointerEnter={() => onAnnotationHover(annotation.id)}
            onPointerLeave={() => onAnnotationHover(undefined)}
          >
            <label className={styles.label} htmlFor={`annotation-${annotation.id}`}>
              <span className={styles.number}>{index + 1}</span>
              Region {index + 1}
            </label>
            <textarea
              ref={(node) => {
                if (node) inputRefs.current.set(annotation.id, node);
                else inputRefs.current.delete(annotation.id);
              }}
              id={`annotation-${annotation.id}`}
              className={styles.input}
              value={annotation.text}
              placeholder="What do you observe here?"
              rows={3}
              onChange={(event) => onTextChange(annotation.id, event.target.value)}
              onFocus={() => onAnnotationHover(annotation.id)}
              onBlur={() => onAnnotationHover(undefined)}
            />
            <button
              className={styles.remove}
              type="button"
              onClick={() => onRemove(annotation.id)}
            >
              Remove region
            </button>
          </div>
        ))}
      </div>
      <form
        className={styles.submitRow}
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <fieldset className={styles.grades}>
          <legend>Your assessment</legend>
          {GRADES.map((grade) => (
            <label className={styles.grade} key={grade.value}>
              <input
                type="radio"
                name="self-assessment-grade"
                value={grade.value}
                checked={selectedGrade === grade.value}
                onChange={() => onGradeChange(grade.value)}
              />
              <span>{grade.value}</span>
              {grade.label}
            </label>
          ))}
        </fieldset>
        <button
          className={styles.submit}
          type="submit"
          disabled={!canSubmit}
        >
          Show model result
        </button>
      </form>
    </aside>
  );
}
