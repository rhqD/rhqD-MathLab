const BPNN = require('./NN/BPNN');
const _ = require('lodash');
const {functions: {tanh}} = require('./rhqD/Node');
const historys = [
  {
    values: '5.979603854319703,7.611357738264375,0.43608740555206493,5.14787603216712,-0.010269348630762266,-5.39234627865641,18.107128480936463,0.4425217000879064,0.5556326144774041,0.28677423301092286,-0.030942067107995803,0.2117583953210615,0.8424031550897384,2.3034175229478806,2.775969166596696,1.0775457628447342,0.46280722344484354,0.36120759380291056,1.5819741345661398,0.16455420964150339,1.951809112425987,4.452873686859579,7.132154499049901,1.7409376312978277,0.8733797043254998,1.985029154935378,3.31574542186406,0.6729989215987692,-3.6274079084350195,-7.027903904816332,-3.591766940454432,-3.3389923916646556,1.2098299116758662,-1.7705601567094902,4.562481171253947,-4.729724365560551,-6.167138438530679,6.139237848594516,1.8099668110656588,-0.9083257606761795,2.634900538246529,-2.6504465201283423',
    accuracy: '0.99311'
  }
];
const myBPNN = new BPNN({input: 2, hls: [4, 4], output: 2, step: 0.05, minE: 0.00000001});

myBPNN.generateTrainSample = () => {
  const x = Math.random() * 100 - 50;
  const y = Math.random() * 100 - 50;
  const area = (x >= 0 ? 2 : 0) + (y >= 0 ? 1 : 0);
  return [x, y, (area === 0 || area === 3) ? 1 : 0, (area === 1 || area === 2) ? 1 : 0];
};

myBPNN.generateTestSample = () => {
  const x = Math.random() * 20 - 10;
  const y = Math.random() * 20 - 10;
  const area = (x >= 0 ? 2 : 0) + (y >= 0 ? 1 : 0);
  return [x, y, (area === 0 || area === 3) ? 1 : 0, (area === 1 || area === 2) ? 1 : 0];
};

myBPNN.judge = (values, expects) => {
  const expectT1 = expects[0];
  const expectT2 = expects[1];
  const valueT1 = values[0];
  const valueT2 = values[1];
  if (_.isNaN(valueT1) || _.isNaN(valueT2)){
    console.error('NaN during test');
    return null;
  }
  return (valueT1 >= valueT2 && expectT1 === 1) || (valueT1 < valueT2 && expectT2 === 1 );
};

let lastAC = 0;
const onTrainInterval = (ac) => {
  if (ac < lastAC){
    // myBPNN.step = myBPNN.step - 0.001;
    // console.log(`adjust step to **${myBPNN.step}**`);
  }
  lastAC = ac;
}

myBPNN.step = 0.01;
// myBPNN.keepTraining({trainTimes: 100, testTimes: 1000, limit: 0.996, minE: 0, onTrainInterval});
myBPNN.train(10000);
// myBPNN.inject(historys[0].values);
myBPNN.keepTesting(10000);
// myBPNN.keepTraining({trainTimes: 100, testTimes: 100000, limit: 0.9999, minE: 0, onTrainInterval});
