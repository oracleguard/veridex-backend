export interface Job {
  id: string;
  type: string;
  data: any;
  status: "pending" | "processing" | "complete" | "failed";
}
