import Image from "next/image";

import styles from "./ImagePreview.module.css";

type ImagePreviewProps = {
  file: File;
  previewUrl: string;
  onReset: () => void;
};

export default function ImagePreview({
  file,
  previewUrl,
  onReset,
}: ImagePreviewProps) {
  return (
    <section className={styles.wrapper} aria-label="Selected image">
      <div className={styles.imageFrame}>
        <Image
          src={previewUrl}
          alt={`Selected fundus image: ${file.name}`}
          fill
          sizes="(max-width: 700px) 100vw, 640px"
          className={styles.image}
          unoptimized
        />
      </div>
      <div className={styles.details}>
        <div>
          <p className={styles.name}>{file.name}</p>
          <p className={styles.meta}>{Math.ceil(file.size / 1024)} KB</p>
        </div>
        <button className={styles.reset} type="button" onClick={onReset}>
          Choose another
        </button>
      </div>
    </section>
  );
}
