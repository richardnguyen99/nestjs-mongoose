export interface GetEpisodeAggregation {
  tconst: string;

  parentTconst: string;

  seasonNumber: number | null;

  episodeNumber: number | null;

  titleType: string;

  primaryTitle: string;

  originalTitle: string;

  isAdult: boolean;

  startYear: number | null;

  endYear: number | null;

  runtimeMinutes: number | null;

  genres: string[];

  imdbUrl: string;
}
