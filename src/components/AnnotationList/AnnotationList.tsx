import { useEffect, useRef } from "react";

import { GRADES, type GradeValue } from "@/types/grade";
import type { Annotation } from "@/types/annotation";
import styles from "./AnnotationList.module.css";

type AnnotationListProps = {
  className?: string;
  annotations: Annotation[];
  focusedAnnotationId?: string;
  onTextChange: (id: string, text: string) => void;
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
  focusedAnnotationId,
  onTextChange,
  onRemove,
  onClear,
  selectedGrade,
  canSubmit,
  onGradeChange,
  onSubmit,
}: AnnotationListProps) {
  const inputRefs = useRef(new Map<string, HTMLTextAreaElement>());

  useEffect(() => {
    if (!focusedAnnotationId) return;
    inputRefs.current.get(focusedAnnotationId)?.focus();
  }, [focusedAnnotationId]);

  return (
    <aside className={`${styles.panel} ${className ?? ""}`} aria-label="Region annotations">
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
          <div className={styles.item} key={annotation.id}>
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
      <div className={styles.submitRow}>
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
          type="button"
          disabled={!canSubmit}
          onClick={onSubmit}
        >
          Show model result
        </button>
      </div>
    </aside>
  );
}
