/* global use, db */
// MongoDB Playground
// To disable this template go to Settings | MongoDB | Use Default Template For Playground.
// Make sure you are connected to enable completions and to be able to run a playground.
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.
// The result of the last command run in a playground is shown on the results panel.
// By default the first 20 documents will be returned with a cursor.
// Use 'console.log()' to print to the debug output.
// For more documentation on playgrounds please refer to
// https://www.mongodb.com/docs/mongodb-vscode/playgrounds/

// Select the database to use.
use("tmdb");

db.episodes.aggregate([
  {
    $match: {
      parentTconst: "tt0898266",
      seasonNumber: 12,
    },
  },
  {
    $sort: {
      episodeNumber: -1,
    },
  },
  { $limit: 1 },
  {
    $lookup: {
      from: "basics",
      localField: "tconst",
      foreignField: "tconst",
      as: "episodeDetails",
    },
  },
  {
    $unwind: "$episodeDetails",
  },
  {
    $project: {
      _id: 0,
      tconst: 1,
      episodeNumber: 1,
      seasonNumber: 1,
      parentTconst: 1,
      titleType: "$episodeDetails.titleType",
      primaryTitle: "$episodeDetails.primaryTitle",
      originalTitle: "$episodeDetails.originalTitle",
      isAdult: "$episodeDetails.isAdult",
      startYear: "$episodeDetails.startYear",
      endYear: "$episodeDetails.endYear",
      runtimeMinutes: "$episodeDetails.runtimeMinutes",
      genres: "$episodeDetails.genres",
    },
  },
]);
