import Head from "next/head";

import ImageAnalysis from "@/containers/ImageAnalysis/ImageAnalysis";
import styles from "@/styles/Home.module.css";

export default function Home() {
  return (
    <>
      <Head>
        <title>Fundus Image Analysis</title>
        <meta
          name="description"
          content="Upload a fundus image for diabetic retinopathy analysis."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className={styles.page}>
        <main className={styles.main}>
          <header className={styles.header}>
            <p className={styles.eyebrow}>Diabetic retinopathy screening</p>
            <h1>Review a fundus image</h1>
            <p className={styles.description}>
              Upload one image to begin the background analysis. Annotation
              tools will be available before results are revealed.
            </p>
          </header>
          <ImageAnalysis />
        </main>
      </div>
    </>
  );
}
