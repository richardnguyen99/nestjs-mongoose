import { AkasDocument } from "../schema/akas.schema";

export interface AkasAggregationInterface {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
  results: AkasDocument[];
}
