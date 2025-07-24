import { CrewsDocument } from "../schema/crews.schema";

export interface CrewsAggregationInterface {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  results: CrewsDocument[];
}
