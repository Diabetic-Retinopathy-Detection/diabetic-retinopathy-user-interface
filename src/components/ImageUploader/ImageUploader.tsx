import { useRef, useState } from "react";

import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
} from "@/types/image";
import styles from "./ImageUploader.module.css";

type ImageUploaderProps = {
  disabled?: boolean;
  onFileSelected: (file: File) => void;
  onValidationError: (message: string) => void;
};

function isAcceptedImage(file: File) {
  return ACCEPTED_IMAGE_TYPES.includes(
    file.type as (typeof ACCEPTED_IMAGE_TYPES)[number],
  );
}

export default function ImageUploader({
  disabled = false,
  onFileSelected,
  onValidationError,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFile(file: File | undefined) {
    if (!file) return;

    if (!isAcceptedImage(file)) {
      onValidationError("Choose a JPG, JPEG, or PNG image.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      onValidationError("Choose an image smaller than 10 MB.");
      return;
    }

    onFileSelected(file);
  }

  return (
    <div
      className={`${styles.dropzone} ${isDragging ? styles.dragging : ""}`}
      onDragEnter={(event) => {
        event.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        if (!disabled) handleFile(event.dataTransfer.files[0]);
      }}
    >
      <input
        ref={inputRef}
        className={styles.input}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        disabled={disabled}
        onChange={(event) => {
          handleFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <p className={styles.title}>Drop a fundus image here</p>
      <p className={styles.help}>JPG, JPEG, or PNG up to 10 MB</p>
      <button
        className={styles.button}
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        Choose image
      </button>
    </div>
  );
}
