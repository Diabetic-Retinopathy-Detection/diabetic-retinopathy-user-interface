import type { PredictionResponse } from "@/types/prediction";
import { GRADES, type GradeValue } from "@/types/grade";
import styles from "./PredictionResult.module.css";

type PredictionResultProps = {
  prediction: PredictionResponse;
  selectedGrade: GradeValue;
  annotationCount: number;
  onBack: () => void;
};

export default function PredictionResult({
  prediction,
  selectedGrade,
  annotationCount,
  onBack,
}: PredictionResultProps) {
  return (
    <section className={styles.panel} aria-label="Model result">
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Analysis result</p>
          <h2>{prediction.predicted_label}</h2>
          <p className={styles.summary}>
            Your assessment: {GRADES[selectedGrade].label} · {annotationCount} region
            {annotationCount === 1 ? "" : "s"} annotated
          </p>
        </div>
        <button className={styles.back} type="button" onClick={onBack}>
          Review image
        </button>
      </div>
      <div className={styles.probabilities}>
        {Object.entries(prediction.probabilities).map(([label, probability]) => (
          <div className={styles.probability} key={label}>
            <div className={styles.probabilityHeader}>
              <span>{label}</span>
              <strong>{(probability * 100).toFixed(1)}%</strong>
            </div>
            <div className={styles.track}>
              <div className={styles.fill} style={{ width: `${probability * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
