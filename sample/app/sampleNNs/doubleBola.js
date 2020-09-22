import BPNN from '../../../NN/BPNN';
import Node from '../../../rhqD/Node';
const disSquare = (x1, y1, x2, y2) => (y2 - y1)**2 + (x2 - x1)**2;

const {functions: {square, div, mul, pow}, constant} = Node;

const doubleBolaNN = new BPNN({
    input: 2,
    hls: [4],
    output: 1,
    step: 0.03,
    minE: 0,
    ramdom: () => (Math.random()),
    normalizeInputs: (inputs) => {
        return inputs.map(row => row.map(it => (div(it, constant(50)))));
    },
    extendInputs: (...inputs) => ([...inputs.map(square)]),
});

doubleBolaNN.generateTrainSample = () => {
    const x = Math.random() * 100 - 50;
    const y = Math.random() * 100 - 50;
    const pred = x**2/400 - y**2/100 > 1;
    return [x, y, pred ? 1 : 0];
};

doubleBolaNN.generateTestSample = () => {
    const x = Math.random() * 200 - 100;
    const y = Math.random() * 200 - 100;
    const pred = x**2/400 - y**2/100 > 1;
    return [x, y, pred ? 1 : 0];
};

doubleBolaNN.judge = (values, expects) => {
    const expectT1 = expects[0];
    const valueT1 = values[0];
    return (valueT1 >= 0.5 && expectT1 === 1) || (valueT1 < 0.5 && expectT1 === 0 );
};

export default doubleBolaNN;
