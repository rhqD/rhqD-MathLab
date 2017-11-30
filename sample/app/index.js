const BPNN = require('../../NN/BPNN');
const _ = require('lodash');
const myBPNN = new BPNN({input: 1, hls: [], output: 1, step: 0.01, minE: 0});
myBPNN.generateTrainSample = () => {
  const x = Math.random() * 100 - 40;
  return [x, x > 10 ? 1 : 0];
};

myBPNN.generateTestSample = () => {
  const x = Math.random() * 200 - 90;
  return [x, x > 10 ? 1 : 0];
};

myBPNN.judge = (values, expects) => {
  const value = values[0];
  const expect = expects[0];
  if (_.isNaN(value) || !_.isNumber(value)){
    console.error('NaN during test');
    return null;
  }
  return expect === 1 && value > 0.5 || expect === 0 && value < 0.5;
};

let lastAC = 0;
const onTrainInterval = (ac) => {
  if (ac < lastAC && ac > 0.95){
    myBPNN.step = myBPNN.step - 0.0000005;
    console.log(`adjust step to **${myBPNN.step}**`);
  }
  lastAC = ac;
}

// myBPNN.keepTraining({trainTimes: 100, testTimes: 100000, limit: 0.92, minE: 0, onTrainInterval});
myBPNN.train(200);
myBPNN.keepTesting(1000);
