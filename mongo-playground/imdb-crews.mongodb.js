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

const { dir } = require("console");

// Select the database to use.
use("tmdb");

db.crews.aggregate([
  {
    $match: {
      tconst: "tt4154796",
    },
  },
  {
    $lookup: {
      from: "names",
      localField: "directors",
      foreignField: "nconst",
      as: "directorsInfo",
      pipeline: [
        {
          $project: {
            _id: 0,
          },
        },
      ],
    },
  },
  {
    $lookup: {
      from: "names",
      localField: "writers",
      foreignField: "nconst",
      as: "writersInfo",
      pipeline: [
        {
          $project: {
            _id: 0,
          },
        },
      ],
    },
  },
]);

db.crew.find({
  tconst: "tt4154796",
});

db.crew.updateMany({}, [
  {
    $set: {
      directors: {
        $cond: {
          if: {
            $eq: ["$directors", null],
          },
          then: [],
          else: "$directors",
        },
      },
    },
  },
]);
