export interface NameDetail {
  primaryName: string;

  birthYear: number | null;

  deathYear: number | null;

  primaryProfession: string[];

  knownForTitles: string[];
}

export interface TitleDetail {
  titleType: string;

  primaryTitle: string;

  originalTitle: string;

  isAdult: boolean;

  startYear: number | null;

  endYear: number | null;

  runtimeMinutes: number | null;

  genres: string[];
}

export interface SinglePrincipalAggregation {
  category: string;

  ordering: number[];

  tconst: string;

  nconst: string;

  job: string[];

  characters: string[];

  nameDetails?: NameDetail;

  titleDetails?: TitleDetail;
}
