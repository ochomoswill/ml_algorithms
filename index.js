let _ = require("lodash");

const calc_euclidean_dist = (training_set, test_set, element_length) => {
  let distance = 0;
  let i = 0;

  for (; i < element_length; i++) {
    distance += Math.pow(parseInt(training_set[i]) - parseInt(test_set[i]), 2);
  }
  console.log("Euclidean distance from x to y: ", distance);
  return distance;
};

const calc_square_dist = (training_set, test_set) => {
  let square_dist = [];
  training_set.map((record, key) => {
    let recordObj = { data: [], square_dist: 0 };
    console.log(record);
    recordObj["data"] = record;
    recordObj["square_dist"] = calc_euclidean_dist(record, test_set, 2);
    square_dist.push(recordObj);
  });
  console.log(square_dist);
  return square_dist;
};

const get_nearest_neighbors = (square_dist, k) => {
  let sorted_square_dist_arr = _.orderBy(square_dist, "square_dist");
  let neighbors = [];
  let i = 0;

  for (; i < k; i++) {
    neighbors.push(sorted_square_dist_arr[i].data);
    console.log(neighbors);
  }
  return neighbors;
};

const voting = neighbors => {
  votes = {};

  neighbors.map((neighbor, key) => {
    category = neighbor[neighbor.length - 1];
    if (votes.hasOwnProperty(category)) {
      votes[category] += 1;
    } else {
      votes[category] = 1;
    }
  });

  console.log(votes);

  let sortedVotes = sortObject(votes);
  return sortedVotes[0];

  //sorted_votes = _.orderBy(votes, "")
};

const sortObject = (object, order) => {
  let keysSorted = Object.keys(object).sort(function(a, b) {
    if (order === "asc") {
      return votes[a] - votes[b];
    } else if (order === "desc") {
      return votes[b] - votes[a];
    }
  });
  return keysSorted;
};

let training_set = [
  [7, 7, "Bad"],
  [7, 4, "Bad"],
  [3, 4, "Good"],
  [1, 4, "Good"]
];
let test_set = [3, 7];
let k = 3;

let square_dist = calc_square_dist(training_set, test_set);
let neighbors_list = get_nearest_neighbors(square_dist, 3);
let identified_category = voting(neighbors_list);
console.log(identified_category);
