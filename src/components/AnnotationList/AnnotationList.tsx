import { useEffect, useRef } from "react";

import type { Annotation } from "@/types/annotation";
import styles from "./AnnotationList.module.css";

type AnnotationListProps = {
  annotations: Annotation[];
  focusedAnnotationId?: string;
  onTextChange: (id: string, text: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
};

export default function AnnotationList({
  annotations,
  focusedAnnotationId,
  onTextChange,
  onRemove,
  onClear,
}: AnnotationListProps) {
  const inputRefs = useRef(new Map<string, HTMLTextAreaElement>());

  useEffect(() => {
    if (!focusedAnnotationId) return;
    inputRefs.current.get(focusedAnnotationId)?.focus();
  }, [focusedAnnotationId]);

  return (
    <aside className={styles.panel} aria-label="Region annotations">
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
    </aside>
  );
}
