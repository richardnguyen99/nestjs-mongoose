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

const cursor = db.akas.aggregate([
  {
    $group: {
      _id: { titleId: "$titleId", ordering: "$ordering" },
      ids: { $push: "$_id" },
      count: { $sum: 1 },
    },
  },
  {
    $match: {
      count: { $gt: 1 },
    },
  },
]);

cursor.forEach((doc) => {
  // Keep the first one, remove the rest
  const [, ...duplicateIds] = doc.ids; // skip the first one
  db.akas.deleteMany({ _id: { $in: duplicateIds } });
});

db.akas.aggregate([
  {
    $match: {
      titleId: "tt4154796",
    },
  },
  {
    $sort: {
      ordering: 1,
    },
  },
  {
    $limit: 50,
  },
]);

db.akas.updateMany({}, [
  {
    $set: {
      isOriginalTitle: {
        $cond: {
          if: { $eq: ["$isOriginalTitle", 1] },
          then: true,
          else: false,
        },
      },
    },
  },
]);
