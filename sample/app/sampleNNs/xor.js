import BPNN from '../../../NN/BPNN';
import Node from '../../../rhqD/Node';

const {functions: {tanh}} = Node;

const xorNN = new BPNN({
    input: 2,
    hls: [2, 2],
    output: 1,
    step: 0.3,
    minE: 0,
    activation: tanh,
    ramdom: () => (Math.random()),
    activateInputs: true,
});

xorNN.generateTrainSample = () => {
    const x = Math.random() * 100 - 50;
    const y = Math.random() * 100 - 50;
    const xb = x > 0;
    const yb = y > 0;
    return [x, y, (xb && yb || !xb && !yb) ? 1 : 0];
};

xorNN.generateTestSample = () => {
    const x = Math.random() * 100 - 50;
    const y = Math.random() * 100 - 50;
    const xb = x > 0;
    const yb = y > 0;
    return [x, y, (xb && yb || !xb && !yb) ? 1 : 0];
};

xorNN.judge = (values, expects) => {
    const expectT1 = expects[0];
    const valueT1 = values[0];
    return (valueT1 >= 0.5 && expectT1 === 1) || (valueT1 < 0.5 && expectT1 === 0 );
};

export default xorNN;
