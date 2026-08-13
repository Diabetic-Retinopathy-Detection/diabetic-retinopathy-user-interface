export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"] as const;

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

export type ImageStatus = "idle" | "loading" | "ready" | "error";
