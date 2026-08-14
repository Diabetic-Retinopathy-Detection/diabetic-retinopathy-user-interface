import { useEffect, useState } from "react";

import AnnotationCanvas from "@/components/AnnotationCanvas/AnnotationCanvas";
import AnnotationList from "@/components/AnnotationList/AnnotationList";
import ImageUploader from "@/components/ImageUploader/ImageUploader";
import PredictionResult from "@/components/PredictionResult/PredictionResult";
import StatusMessage from "@/components/StatusMessage/StatusMessage";
import { predictImage } from "@/lib/api/predictImage";
import type { Annotation } from "@/types/annotation";
import { NO_RETINOPATHY_GRADE, type GradeValue } from "@/types/grade";
import type { ImageStatus } from "@/types/image";
import type { PredictionResponse } from "@/types/prediction";
import styles from "./ImageAnalysis.module.css";

export default function ImageAnalysis() {
  const [file, setFile] = useState<File>();
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [status, setStatus] = useState<ImageStatus>("idle");
  const [error, setError] = useState<string>();
  const [prediction, setPrediction] = useState<PredictionResponse>();
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [focusedAnnotationId, setFocusedAnnotationId] = useState<string>();
  const [selectedGrade, setSelectedGrade] = useState<GradeValue>();
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function handleFileSelected(selectedFile: File) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setPrediction(undefined);
    setAnnotations([]);
    setFocusedAnnotationId(undefined);
    setSelectedGrade(undefined);
    setHasSubmitted(false);
    setError(undefined);
    setStatus("loading");

    try {
      const result = await predictImage(selectedFile);
      setPrediction(result);
      setStatus("ready");
    } catch (requestError) {
      setStatus("error");
      setError(
        requestError instanceof Error
          ? requestError.message
          : "The image could not be analyzed.",
      );
    }
  }

  function reset() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(undefined);
    setPreviewUrl(undefined);
    setPrediction(undefined);
    setAnnotations([]);
    setFocusedAnnotationId(undefined);
    setSelectedGrade(undefined);
    setHasSubmitted(false);
    setError(undefined);
    setStatus("idle");
  }

  function handleValidationError(message: string) {
    setError(message);
    setStatus("error");
  }

  const meetsAnnotationRequirements =
    selectedGrade === NO_RETINOPATHY_GRADE ||
    (selectedGrade !== undefined && annotations.length > 0);
  const canSubmit = meetsAnnotationRequirements && prediction !== undefined;

  return (
    <section className={styles.container}>
      {!file || !previewUrl ? (
        <ImageUploader
          className={styles.uploader}
          onFileSelected={handleFileSelected}
          onValidationError={handleValidationError}
        />
      ) : !hasSubmitted ? (
        <AnnotationCanvas
          className={styles.canvas}
          file={file}
          previewUrl={previewUrl}
          annotations={annotations}
          onAnnotationCreated={(annotation) => {
            setAnnotations((current) => [...current, annotation]);
            setFocusedAnnotationId(annotation.id);
          }}
          onReset={reset}
        />
      ) : null}

      {file && previewUrl && !hasSubmitted && (
        <AnnotationList
          className={styles.annotationList}
          annotations={annotations}
          focusedAnnotationId={focusedAnnotationId}
          onTextChange={(id, text) => {
            setAnnotations((current) =>
              current.map((annotation) =>
                annotation.id === id ? { ...annotation, text } : annotation,
              ),
            );
          }}
          onRemove={(id) => {
            setAnnotations((current) =>
              current.filter((annotation) => annotation.id !== id),
            );
            setFocusedAnnotationId(undefined);
          }}
          onClear={() => {
            setAnnotations([]);
            setFocusedAnnotationId(undefined);
          }}
          selectedGrade={selectedGrade}
          canSubmit={canSubmit}
          onGradeChange={setSelectedGrade}
          onSubmit={() => setHasSubmitted(true)}
        />
      )}

      {status !== "idle" && (
        <div className={styles.status}>
          <StatusMessage status={status} message={error} />
        </div>
      )}

      {hasSubmitted && prediction && selectedGrade !== undefined && (
        <PredictionResult
          prediction={prediction}
          selectedGrade={selectedGrade}
          annotationCount={annotations.length}
          onBack={() => setHasSubmitted(false)}
        />
      )}
    </section>
  );
}
