import { Scholarship } from "@/types";

export interface IngestionSource {
  name: string;
  fetch(): Promise<Scholarship[]>;
}
