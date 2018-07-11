let _ = require("lodash");

/* Back Propagation 

	Given inputs 0.05 and 0.10, we want the neural network to output 0.01 and 0.99.

*/

// class for the whole ANN
class Network {
    constructor(
        inputs_neu_count,
        hidden_neu_count,
        output_neu_count,
        hidden_layer_weights,
        hidden_layer_bias,
        output_layer_weights,
        output_layer_bias
    ) {
        this.learning_rate = 0.4;

        this.inputs_neu_count = inputs_neu_count;

        this.hidden_layer = new NeuronLayer(hidden_neu_count, hidden_layer_bias);
        this.output_layer = new NeuronLayer(output_neu_count, output_layer_bias);

        this.initHiddenLayerInputWeights(hidden_layer_weights);
        this.initOutputLayerInputWeights(output_layer_weights);
    }

    initHiddenLayerInputWeights(hidden_layer_weights) {
        let weight_num = 0;
        this.hidden_layer.neurons.map((neuron, key) => {
            for (let i = 0; i < this.inputs_neu_count; i++) {
                if (!hidden_layer_weights) {
                    // replace with random
                    neuron.weights.push(Math.random());
                } else {
                    neuron.weights.push(hidden_layer_weights[weight_num]);
                }
                weight_num += 1;
            }
        });
        //console.log(this.hidden_layer.neurons);
    }

    initOutputLayerInputWeights(output_layer_weights) {
        let weight_num = 0;
        this.output_layer.neurons.map((output_neuron, key) => {
            this.hidden_layer.neurons.map((hidden_neuron, key) => {
                if (!output_layer_weights) {
                    // replace with random
                    output_neuron.weights.push(Math.random());
                } else {
                    output_neuron.weights.push(output_layer_weights[weight_num]);
                }
                weight_num += 1;
            });
        });
        //console.log(this.output_layer.neurons);
    }

    inspect() {
        console.log("----------------");
        console.log("* Inputs: ", this.inputs_neu_count);
        console.log("----------------");
        console.log("Hidden Layer");
        console.log("----------------");
        this.hidden_layer.inspect();
        console.log("----------------");
        console.log("* Output Layer: ");
        console.log("----------------");
        this.output_layer.inspect();
        console.log("----------------");
    }

    feedForward(inputs) {
        let hidden_layer_outputs = this.hidden_layer.feedForward(inputs);
        this.inspect();
        return this.output_layer.feedForward(hidden_layer_outputs);
    }

    train(training_inputs, training_outputs) {
        this.feedForward(training_inputs);

        //Output neuron deltas
        let errors_wrt_output_total_net_input = new Array(this.output_layer.neurons.length).fill(0);
        this.output_layer.neurons.map((neuron, key) => {
            errors_wrt_output_total_net_input[key] = neuron.calculateErrorWrtTotalNetInput(training_outputs[key]);
        });


        //Hidden neuron deltas
        // Calculate the derivative of the error with respect to the output of each hidden layer neuron
        let errors_wrt_hidden_total_net_input = new Array(this.hidden_layer.neurons.length).fill(0);
        this.hidden_layer.neurons.map((hidden_neuron, key1) => {
            let derivative_err_wrt_hidden_output = 0;
            this.output_layer.neurons.map((output_neuron, key) => {
                derivative_err_wrt_hidden_output += errors_wrt_output_total_net_input[key] * output_neuron.weights[key1];
            });

            errors_wrt_hidden_total_net_input[key1] = derivative_err_wrt_hidden_output * hidden_neuron.calculateTotalNetInputWrtInput();
        });


        //Update output neuron weights
        this.output_layer.neurons.map((output_neuron, key1) => {
            let output_neuron_weights = [];
            //console.log("Initial Output weights ", output_neuron.weights);
            output_neuron.weights.map((output_weight, key) => {
                let pd_err_wrt_weight = errors_wrt_output_total_net_input[key1] * output_neuron.calculateTotalNetInputWrtWeight(key);
                output_weight -= this.learning_rate * pd_err_wrt_weight;
                output_neuron_weights.push(output_weight);
            });
            output_neuron.weights = output_neuron_weights;
        });


        // Update hidden neuron weights
        this.hidden_layer.neurons.map((hidden_neuron, key1) => {
            let hidden_neuron_weights = [];
            hidden_neuron.weights.map((weight, key) => {
                let pd_err_wrt_weight = errors_wrt_hidden_total_net_input[key1] * hidden_neuron.calculateTotalNetInputWrtWeight(key);
                weight -= this.learning_rate * pd_err_wrt_weight;
                hidden_neuron_weights.push(weight);
                //console.log(weight);
            });
            hidden_neuron.weights = hidden_neuron_weights;
        });
    }

    calculateTotalError(training_sets) {
        let total_err = 0;
        training_sets.map((set, key1) => {
            let training_inputs = set[0];
            let training_outputs = set[set.length - 1];
            this.feedForward(training_inputs);
            training_outputs.map((output, key) => {
                total_err += this.output_layer.neurons[key].calculateError(output);
                //console.log("At total error ", total_err);
            });
        });

        return total_err;
    }
}

class NeuronLayer {
    constructor(neurons_count, bias) {
        this._bias = bias;

        this.neurons = [];

        for (let i = 0; i < neurons_count; i++) {
            this.neurons.push(new Neuron(this._bias));
        }
    }

    inspect() {
        console.log("Neurons:", this.neurons.length);
        this.neurons.map((neuron, key) => {
            console.log("	Neuron", key);
            neuron.weights.map((weight, key2) => {
                console.log("	Weight:", weight);
            });
            console.log("	Bias:", this._bias);
        });
    }

    feedForward(inputs) {
        let outputs = [];
        this.neurons.map((neuron, key) => {
            outputs.push(neuron.calculateOutput(inputs));
        });
        //console.log("Outputs ", outputs);
        return outputs;
    }

    getOutputs() {
        let outputs = [];
        this.neurons.map((neuron, key) => {
            outputs.push(neuron.output);
        });
        return outputs;
    }
}

class Neuron {
    constructor(bias) {
        this._bias = bias;
        this.weights = [];
        this.inputs = [];
        this.output = 0;
    }

    calculateOutput(inputs) {
        this.inputs = inputs;
        this.output = this.squash(this.calculateTotalNetInput());
        return this.output;
    }

    calculateTotalNetInput() {
        let total = 0;
        this.inputs.map((input, key) => {
            total += input * this.weights[key];
        });
        return total + this._bias;
    }

    squash(total_net_input) {
        // logistics function
        return 1 / (1 + Math.exp(-total_net_input));
    }

    calculateError(target_output) {
        // error function
        return 0.5 * Math.pow(target_output - this.output, 2);
    }

    calculateErrorWrtOutput(target_output) {
        // derivative of error function
        return -(target_output - this.output);
    }

    calculateTotalNetInputWrtInput() {
        // derivative of logistics function
        return this.output * (1 - this.output);
    }

    calculateErrorWrtTotalNetInput(target_output) {
        return (this.calculateErrorWrtOutput(target_output) *  this.calculateTotalNetInputWrtInput());
    }

    calculateTotalNetInputWrtWeight(index) {
        return this.inputs[index];
    }
}



nn = new Network(
    2,
    2,
    2,
    (hidden_layer_weights = [0.15, 0.2, 0.25, 0.3]),
    (hidden_layer_bias = 0.35),
    (output_layer_weights = [0.4, 0.45, 0.5, 0.55]),
    (output_layer_bias = 0.6)
);
let i = 0;
for (; i < 100; i++) {
    console.log("\nEpoch ", i);
    console.log("================");
    nn.train([0.05, 0.1], [0.01, 0.99]);
    console.log('Epoch ', i , '=>', nn.calculateTotalError([[[0.05, 0.1], [0.01, 0.99]]]));
}
