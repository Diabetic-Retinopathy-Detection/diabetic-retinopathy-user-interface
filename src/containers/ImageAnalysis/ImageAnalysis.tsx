import { useEffect, useState } from "react";

import ImagePreview from "@/components/ImagePreview/ImagePreview";
import ImageUploader from "@/components/ImageUploader/ImageUploader";
import StatusMessage from "@/components/StatusMessage/StatusMessage";
import { predictImage } from "@/lib/api/predictImage";
import type { ImageStatus } from "@/types/image";
import type { PredictionResponse } from "@/types/prediction";
import styles from "./ImageAnalysis.module.css";

export default function ImageAnalysis() {
  const [file, setFile] = useState<File>();
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [status, setStatus] = useState<ImageStatus>("idle");
  const [error, setError] = useState<string>();
  const [prediction, setPrediction] = useState<PredictionResponse>();

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
    setError(undefined);
    setStatus("idle");
  }

  function handleValidationError(message: string) {
    setError(message);
    setStatus("error");
  }

  return (
    <section className={styles.container}>
      {!file || !previewUrl ? (
        <ImageUploader
          onFileSelected={handleFileSelected}
          onValidationError={handleValidationError}
        />
      ) : (
        <ImagePreview file={file} previewUrl={previewUrl} onReset={reset} />
      )}

      {status !== "idle" && (
        <StatusMessage status={status} message={error} />
      )}

      {prediction && (
        <p className={styles.hiddenResult} aria-hidden="true">
          Prediction received: {prediction.predicted_label}
        </p>
      )}
    </section>
  );
}
