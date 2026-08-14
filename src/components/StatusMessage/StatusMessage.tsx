import styles from "./StatusMessage.module.css";

type StatusMessageProps = {
  status: "loading" | "ready" | "error";
  message?: string;
};

export default function StatusMessage({ status, message }: StatusMessageProps) {
  return (
    <div
      className={`${styles.message} ${status === "error" ? styles.error : ""}`}
      role={status === "error" ? "alert" : "status"}
      aria-live="polite"
    >
      {status === "loading" && "Analyzing image in the background..."}
      {status === "ready" && "Analysis complete. Results will appear after annotation."}
      {status === "error" && message}
    </div>
  );
}
