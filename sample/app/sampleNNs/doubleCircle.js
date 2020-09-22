import BPNN from '../../../NN/BPNN';
import Node from '../../../rhqD/Node';
const disSquare = (x1, y1, x2, y2) => (y2 - y1)**2 + (x2 - x1)**2;

const {functions: {square, div, mul, pow}, constant} = Node;

const doubleCircleNN = new BPNN({
    input: 2,
    hls: [8, 4],
    output: 1,
    step: 0.3,
    minE: 0,
    ramdom: () => (Math.random()),
    normalizeInputs: (inputs) => {
        return inputs.map(row => row.map(it => (div(it, constant(50)))));
    },
    extendInputs: (...inputs) => ([mul(...inputs), ...inputs.map(square)]),
});

doubleCircleNN.generateTrainSample = () => {
    const x = Math.random() * 100 - 50;
    const y = Math.random() * 100 - 50;
    const d1 = disSquare(x, y, -25, 25);
    const d2 = disSquare(x, y, 25, 0);
    const inCircleA = d1 <= 100;
    const inCircleB = d2 <= 100;
    return [x, y, (inCircleA || inCircleB) ? 1 : 0];
};

doubleCircleNN.generateTestSample = () => {
    const x = Math.random() * 200 - 100;
    const y = Math.random() * 200 - 100;
    const d1 = disSquare(x, y, -25, 25);
    const d2 = disSquare(x, y, 25, 0);
    const inCircleA = d1 <= 100;
    const inCircleB = d2 <= 100;
    return [x, y, (inCircleA || inCircleB) ? 1 : 0];
};

doubleCircleNN.judge = (values, expects) => {
    const expectT1 = expects[0];
    const valueT1 = values[0];
    return (valueT1 >= 0.5 && expectT1 === 1) || (valueT1 < 0.5 && expectT1 === 0 );
};

export default doubleCircleNN;
