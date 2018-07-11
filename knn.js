let _ = require("lodash");

/* K - Nearest Neighbors for Classification  */

// Start of Class
class KNN {
    constructor(no_nearest_neighbors, training_set, test_set) {
        this._no_nearest_neighbors = no_nearest_neighbors;
        console.log("\nK = ", this._no_nearest_neighbors);
        this._training_set = training_set;
        console.log("\nTraining set =>");
        console.log(this._training_set);

        this._test_set = test_set;
        console.log("\nTest set =>");
        console.log(this._test_set);
    }

    calc_euclidean_dist(training_set, test_set, element_length) {
        let distance = 0;
        let i = 0;

        for (; i < element_length; i++) {
            distance += Math.pow(
                parseInt(training_set[i]) - parseInt(test_set[i]),
                2
            );
        }
        return distance;
    }

    calc_square_dist(training_set, test_set) {
        let square_dist = [];
        training_set.map((record, key) => {
            let recordObj = {data: [], square_dist: 0};
            recordObj["data"] = record;
            recordObj["square_dist"] = this.calc_euclidean_dist(record, test_set, 2);
            square_dist.push(recordObj);
        });
        console.log("\nTraining set with Euclidean Dist squared => ");
        console.log(square_dist);
        return square_dist;
    }

    get_nearest_neighbors(square_dist, k) {
        let sorted_square_dist_arr = _.orderBy(square_dist, "square_dist");
        let neighbors = [];
        let i = 0;

        for (; i < k; i++) {
            neighbors.push(sorted_square_dist_arr[i].data);
        }
        console.log("\nList of Neighbors => ");
        console.log(neighbors);
        return neighbors;
    }

    voting(neighbors) {
        let votes = {};

        neighbors.map((neighbor, key) => {
            let category = neighbor[neighbor.length - 1];
            if (votes.hasOwnProperty(category)) {
                votes[category] += 1;
            } else {
                votes[category] = 1;
            }
        });
        console.log("\nList of votes =>");
        console.log(votes);

        let sortedVotes = this.sortObject(votes);
        return sortedVotes[0];

        //sorted_votes = _.orderBy(votes, "")
    }

    sortObject(object, order) {
        let keysSorted = Object.keys(object).sort(function (a, b) {
            if (order === "asc") {
                return votes[a] - votes[b];
            } else if (order === "desc") {
                return votes[b] - votes[a];
            }
        });
        return keysSorted;
    }
}

let training_set = [
    [7, 7, "Bad"],
    [7, 4, "Bad"],
    [3, 4, "Good"],
    [1, 4, "Good"]
];
let test_set = [3, 7];
let k = 3;

let knn = new KNN(3, training_set, test_set);

let square_dist = knn.calc_square_dist(training_set, test_set);
let neighbors_list = knn.get_nearest_neighbors(square_dist, 3);
let identified_category = knn.voting(neighbors_list);
console.log("\nThe toilet paper could categorized as", identified_category);
