import BPNN from '../../../NN/BPNN';
import Node from '../../../rhqD/Node';

const {functions: {square, div}, constant} = Node;

const circleNN = new BPNN({
    input: 2,
    hls: [],
    output: 1,
    step: 0.3,
    minE: 0,
    ramdom: () => (Math.random()),
    normalizeInputs: (inputs) => {
        return inputs.map(row => row.map(it => (div(it, constant(100)))));
    },
    extendInputs: (...inputs) => (inputs.map(square)),
});

circleNN.generateTrainSample = () => {
    const x = Math.random() * 100 - 50;
    const y = Math.random() * 100 - 50;
    return [x, y, x * x + y * y > 400 ? 1 : 0];
    // return [x, y, (xb && yb || !xb && !yb) ? 1 : 0];
};

circleNN.generateTestSample = () => {
    const x = Math.random() * 100 - 50;
    const y = Math.random() * 100 - 50;
    return [x, y, x * x + y * y > 400 ? 1 : 0];
    // return [x, y, (xb && yb || !xb && !yb) ? 1 : 0];
};

circleNN.judge = (values, expects) => {
    const expectT1 = expects[0];
    const valueT1 = values[0];
    return (valueT1 >= 0.5 && expectT1 === 1) || (valueT1 < 0.5 && expectT1 === 0 );
};

export default circleNN;
