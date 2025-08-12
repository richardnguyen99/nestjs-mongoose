export interface RoleDetails {
  ordering: number;
  category: "director" | "writer";
  job?: string | null;
  characters?: string[] | null;
}
export interface CrewInfo {
  nconst: string;
  primaryName: string;
  birthYear: number | null;
  deathYear: number | null;
  roleDetails: RoleDetails;
}

export interface CrewResult {
  tconst: string;
  directors: string[];
  writers: string[];
  directorsInfo: CrewInfo[];
  writersInfo: CrewInfo[];
}

export interface CrewsAggregationInterface {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  results: CrewResult[];
}
