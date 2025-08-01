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
db.principals.find({ tconst: "tt4154796", nconst: "nm1411347" });

// db.principals.findOne({
// tconst: "tt4154796",
// nconst: "nm0000375",
// ordering: 1,
// });

// Find one document and update it
// db.principals.findOneAndUpdate(
// {
// tconst: "tt4154796",
// nconst: "nm0000375",
// ordering: 1,
// },
// {
// $set: {
// characters: ["Tony Stark"],
// },
// },
// {
// returnNewDocument: true,
// },
// );

// Insert a new principal document
// db.principals.insertMany([
// {
// tconst: "tt4154796",
// ordering: 1,
// nconst: "nm0000375",
// category: "actor",
// job: null,
// characters: ["Tony Stark"],
// },
// {
// tconst: "tt4154796",
// ordering: 2,
// nconst: "nm0000375",
// category: "actor",
// job: null,
// characters: ["Iron Man"],
// },
// ]);

// db.principals.findOne({ tconst: "tt2916962", nconst: "nm0000569" });

// Find all documents by tconst and group by nconst
db.principals.aggregate([
  {
    $match: {
      tconst: "tt4154796",
      category: { $in: ["actor", "actress"] }, // Filter for actor or actress categories
    },
  },
  {
    $group: {
      _id: { tconst: "$tconst", nconst: "$nconst" }, // Group by tconst and nconst
      characters: { $push: "$characters" }, // Collect all characters into an array
      category: { $first: "$category" }, // Take the first category
      ordering: { $min: "$ordering" }, // Take the minimum ordering
    },
  },
  {
    $project: {
      _id: 0, // Exclude _id field
      tconst: "$_id.tconst",
      nconst: "$_id.nconst",
      category: 1,
      ordering: 1,
      characters: {
        $reduce: {
          input: "$characters",
          initialValue: [],
          in: { $concatArrays: ["$$value", "$$this"] }, // Flatten the array of arrays
        },
      },
    },
  },
  {
    $sort: { ordering: 1 }, // Sort by ordering
  },
]);
