export type PredictionResponse = {
  status: "ok";
  predicted_label: string;
  probabilities: Record<string, number>;
};
