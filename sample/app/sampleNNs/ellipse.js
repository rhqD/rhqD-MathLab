import BPNN from '../../../NN/BPNN';
import Node from '../../../rhqD/Node';

const {functions: {square, div}, constant} = Node;

const ellipseNN = new BPNN({
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

ellipseNN.generateTrainSample = () => {
    const x = Math.random() * 100 - 50;
    const y = Math.random() * 100 - 50;
    return [x, y, (x**2/900 + y**2/400 > 1) ? 1 : 0];
};

ellipseNN.generateTestSample = () => {
    const x = Math.random() * 100 - 50;
    const y = Math.random() * 100 - 50;
    return [x, y, (x**2/900 + y**2/400 > 1) ? 1 : 0];
};

ellipseNN.judge = (values, expects) => {
    const expectT1 = expects[0];
    const valueT1 = values[0];
    return (valueT1 >= 0.5 && expectT1 === 1) || (valueT1 < 0.5 && expectT1 === 0 );
};

export default ellipseNN;
