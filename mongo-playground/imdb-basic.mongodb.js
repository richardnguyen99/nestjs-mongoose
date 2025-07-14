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

use("tmdb");

db.basics.find({
  endYear: { $type: "string" },
});

use("tmdb");
// Find all documents where the genres array is more than one element
db.basics.find({
  genres: { $exists: true, $type: "array", $size: { $gt: 1 } },
});

use("tmdb");
// Lowercase all genres in the genres array
db.basics.updateMany({}, [
  {
    $set: {
      genres: {
        $map: {
          input: "$genres",
          as: "genre",
          in: { $toLower: "$$genre" }, // Convert each genre to lowercase
        },
      },
    },
  },
]);

use("tmdb");
db.basics.distinct("titleType");

use("tmdb");
// Find all documents where primaryTitle is different from originalTitle
db.basics.find({
  $expr: { $ne: ["$primaryTitle", "$originalTitle"] },
  startYear: { $gte: 2000 },
});

use("tmdb");
db.basics.updateMany(
  {
    isAdult: { $exists: true },
  },
  [
    {
      $set: {
        isAdult: {
          $cond: {
            if: {
              $eq: ["$isAdult", 1],
            },
            then: true,
            else: {
              $cond: {
                if: { $eq: ["$isAdult", 0] },
                then: false,
                else: false, // Default value if isAdult is not 1 or 0
              },
            },
          },
        },
      },
    },
  ],
);

db.basics.find({ titleType: "tvPilot" });

// get total counts for each type of titleType
db.basics.aggregate([
  {
    $group: {
      _id: "$titleType",
      count: { $sum: 1 },
    },
  },
  {
    $sort: { count: -1 }, // Sort by count in descending order
  },
]);

use("tmdb");
db.basics.find({
  runtimeMinutes: {
    $type: "string",
  },
});

db.basics.countDocuments();

use("tmdb");
db.basics.updateMany({ runtimeMinutes: { $type: "string" } }, [
  {
    $set: {
      runtimeMinutes: {
        $convert: {
          input: "$runtimeMinutes",
          to: "int",
          onError: null, // Default value in case of error
          onNull: 0, // Default value if the field is null
        },
      },
    },
  },
]);
