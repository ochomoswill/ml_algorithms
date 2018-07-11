
// class for Nodes
class Node{
    constructor(fv_size=10, pv_size=10, y=0, x=0){
        this.fv_size = fv_size;
        this.pv_size = pv_size;

        // Feature Vector
        this.fv = new Array(fv_size).fill(0);
        // Prediction Vector
        this.pv = new Array(pv_size).fill(0);

        // x and y coordinates for positioning of the node
        this.x = x;
        this.y = y;

        // Assigning random weights to the Feature Vector
        for(let i=0; i<fv_size; i++){
            this.fv[i] = Math.random();
        }

        // Assigning random weights to the Prediction Vector
        for(let i=0; i<pv_size; i++){
            this.pv[i] = Math.random()
        }
    }
}

class SOM{
    constructor(height=10, width=10, fv_size=10, pv_size=10, radius=false, learning_rate=0.005){
        // dimensions of the SOM
        this.height = height;
        this.width = width;

        // radius of the SOM
        if(radius){
            this.radius = radius;
        }else{
            this.radius = (height + width)/2;
        }

        // total number of nodes that can be accomodated on the SOM
        this.total = height * width;

        // the learning rate
        this.learning_rate = learning_rate;

        // initializing all the nodes in the SOM
        this.nodes = new Array(this.total).fill(0);

        // vector sizes in the MAP
        this.fv_size = fv_size;
        this.pv_size = pv_size;

        // creation of the nodes defining the weights and positions
        for (let i=0; i<this.height; i++){
            for(let j=0; j< this.width; j++){
                this.nodes[ i * this.width + j] = new Node(fv_size, pv_size, i, j);
            }
        }

    }


    // training of the SOM
    train(iterations=1000, train_vector=[[[0.0], [0.0]]]){
        let time_constant = iterations/Math.log(this.radius);
        let radius_decaying = 0;
        let learning_rate_decaying = 0;
        let influence = 0;
        // Stack for storing BMU's index and updating the vectors
        let stack = [];
        let temp_fv = new Array(this.fv_size).fill(0);
        let temp_pv = new Array(this.pv_size).fill(0);

        for(let i=1; i< (iterations+1); i++){
            console.log("Iteration number ", i);

            // reducing the BMU's Neighbourhood radius
            radius_decaying = this.radius * Math.exp(-1 * i/time_constant);
            learning_rate_decaying = this.learning_rate * Math.exp(-1 * i/time_constant);

            train_vector.map((vector, key) => {
                let input_fv = vector[0];
                let input_pv = vector[1];
                let best = this.bestMatch(input_fv);
                stack = [];

                console.log("Best", best);


                for(let j=0; j< this.total; j++){
                    // calculate the distance between the BMU and the nodes
                    let dist = SOM.distance(this.nodes[best], this.nodes[j]);
                    if(dist < radius_decaying){
                        temp_fv = new Array(this.fv_size).fill(0);
                        temp_pv = new Array(this.pv_size).fill(0);
                        influence = Math.exp((-1.0 * (Math.pow(dist, 2)))/(2 * radius_decaying * i));

                        for(let l=0; l<this.fv_size; l++){
                            // altering the weights of the nodes in the BMU's Neighbourhood
                            temp_fv[l] = this.nodes[j].fv[l] + influence * learning_rate_decaying * (input_fv[l] - this.nodes[j].fv[l])
                        }

                        for(let l=0; l<this.pv_size; l++){
                            // altering the weights of the nodes in the BMU's Neighbourhood
                            temp_pv[l] = this.nodes[j].pv[l] + influence * learning_rate_decaying * (input_pv[l] - this.nodes[j].pv[l])
                        }

                        let temp_arr = [[[j], temp_fv, temp_pv]];

                        // updating the stack
                        SOM.insertArrayAt(stack, 0, temp_arr);
                    }
                }

                // updating the nodes with the new weights
                stack.map((st, key2) => {
                    this.nodes[stack[key2][0][0]].fv = stack[key2][1];
                    this.nodes[stack[key2][0][0]].pv = stack[key2][2];
                })
            })
        }
    }

    // calculate the prediction vector
    predict(fv =[0]){
        let best = this.bestMatch(fv);
        return this.nodes[best].pv
    }

    // function for inserting an array at the start of the array
    static insertArrayAt(array, index, arrayToInsert) {
        Array.prototype.splice.apply(array, [index, 0].concat(arrayToInsert));
        return array;
    }

    // calculate the best match
    bestMatch(target_fv = [0]){
        // initializing the min distance
        let min = Math.sqrt(this.fv_size);
        // initializing the min node
        let min_index = 1;
        let temp = 0;
        for (let l=0; l<this.total; l++){
            temp = 0;
            temp = this.fvDistance(this.nodes[l].fv, target_fv);
            if(temp < min){
                min = temp;
                min_index = l;
            }
        }

        return min_index
    }

    fvDistance(fv_1=[0],fv_2=[0]){
        let temp = 0;
        for(let j=0; j<this.fv_size; j++){
            temp = temp + Math.pow((fv_1[j] - fv_2[j]), 2)
        }

        temp = Math.sqrt(temp);
        return temp;
    }

    // calculate Euclidean Distance
    static distance(node1, node2){
        return Math.sqrt((Math.pow((node1.x - node2.x),2) + (Math.pow((node1.y - node2.y),2))));
    }
}


console.log("Initialization");
let a = new SOM(5, 5, 2, 1, false, 0.06);

console.log("Training for the XOR function...");
a.train(1000, [[[1, 0], [1]], [[1, 1], [0]], [[0, 1], [1]], [[0, 0], [0]]]);

console.log("Predictions for the XOR function...");

console.log("Prediction 0 0,", Math.round(a.predict([0, 0])[0]));
console.log("Prediction 1 0,", Math.round(a.predict([1, 0])[0]));
console.log("Prediction 0 1,", Math.round(a.predict([0, 1])[0]));
console.log("Prediction 1 1,", Math.round(a.predict([1, 1])[0]));

