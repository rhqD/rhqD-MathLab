const BPNN = require('../../NN/BPNN');
const _ = require('lodash');
const Node = require('../../rhqD/Node');
const {functions: {tanh, sigmod, square}} = Node;

const smallBPNN = new BPNN({input: 2, hls: [2, 2], output: 1, step: 0.3, minE: 0, activation: tanh, ramdom: () => (Math.random())});
smallBPNN.generateTrainSample = () => {
  const x = Math.random() * 100 - 50;
  const y = Math.random() * 100 - 50;
  const xb = x > 0;
  const yb = y > 0;
  return [x, y, (xb && yb || !xb && !yb) ? 1 : 0];
  // return [x, y, (xb && yb || !xb && !yb) ? 1 : 0];
};

smallBPNN.generateTestSample = () => {
  const x = Math.random() * 100 - 50;
  const y = Math.random() * 100 - 50;
  const xb = x > 0;
  const yb = y > 0;
  return [x, y, (xb && yb || !xb && !yb) ? 1 : 0];
  // return [x, y, (xb && yb || !xb && !yb) ? 1 : 0];
};

smallBPNN.judge = (values, expects) => {
  const expectT1 = expects[0];
  const valueT1 = values[0];
  return (valueT1 >= 0.5 && expectT1 === 1) || (valueT1 < 0.5 && expectT1 === 0 );
};

const smallBPNN2 = new BPNN({input: 2, hls: [], output: 1, step: 0.3, minE: 0, activation: tanh, ramdom: () => (Math.random())});
smallBPNN2.generateTrainSample = () => {
  const x = Math.random() * 100 - 50;
  const y = Math.random() * 100 - 50;
  const l = x * x + y * y;
  return [x * x / 2500, y * y / 2500, l > 900 ? 1 : 0];
  // return [x, y, (xb && yb || !xb && !yb) ? 1 : 0];
};

smallBPNN2.generateTestSample = () => {
  const x = Math.random() * 100 - 50;
  const y = Math.random() * 100 - 50;
  const l = x * x + y * y;
  return [x * x / 2500, y * y / 2500, l > 900 ? 1 : 0];
  // return [x, y, (xb && yb || !xb && !yb) ? 1 : 0];
};

smallBPNN2.judge = (values, expects) => {
  const expectT1 = expects[0];
  const valueT1 = values[0];
  return (valueT1 >= 0.5 && expectT1 === 1) || (valueT1 < 0.5 && expectT1 === 0 );
};

const smallBPNN3 = new BPNN({input: 2, hls: [], output: 1, step: 0.3, minE: 0, activation: tanh, ramdom: () => (Math.random() / 1000)});
smallBPNN3.generateTrainSample = () => {
  const x = Math.random() * 5000 - 2500;
  const y = Math.random() * 5000 - 2500;
  return [x, y, x + y > 0 ? 1 : 0];
  // return [x, y, (xb && yb || !xb && !yb) ? 1 : 0];
};

smallBPNN3.generateTestSample = () => {
  const x = Math.random() * 5000 - 2500;
  const y = Math.random() * 5000 - 2500;
  return [x, y, x + y > 0 ? 1 : 0];
  // return [x, y, (xb && yb || !xb && !yb) ? 1 : 0];
};

smallBPNN3.judge = (values, expects) => {
  const expectT1 = expects[0];
  const valueT1 = values[0];
  return (valueT1 >= 0.5 && expectT1 === 1) || (valueT1 < 0.5 && expectT1 === 0 );
};

const drawImage = (points) => {
  const img = new ImageData(100, 100);
  points.forEach((arr, i) => {
    arr.forEach((item, j) => {
      const startIndex = i * 400 + 4 * j;
      if (item > 0.5){
        img.data[startIndex] = 246;
        img.data[startIndex + 1] = 184;
        img.data[startIndex + 2] = 113;
        img.data[startIndex + 3] = _.parseInt(510 * (item - 0.5));
      } else {
        img.data[startIndex] = 97;
        img.data[startIndex + 1] = 167;
        img.data[startIndex + 2] = 211;
        img.data[startIndex + 3] = _.parseInt(510 * (0.5 - item));
      }
    });
  });
  return img;
}


// myBPNN.step = 0.1;
// myBPNN.inject('-30, 10, 20, -20, 20, -20, -10, 20, 20');
// myBPNN.train(10000);
// myBPNN.inject(historys[0].values);


// myBPNN.keepTraining({trainTimes: 100, testTimes: 100000, limit: 0.9999, minE: 0, onTrainInterval});
// onmessage = (event) => {
//   const generateImg = () => {
//     const points = _.range(0, 100).map((x) => (_.range(0, 100)));
//     const {inputs, outputs} = myBPNN.expressions;
//     points.forEach((arr, i) => {
//       arr.forEach((item, j) => {
//         inputs[0].value = i - 50;
//         inputs[1].value = j - 50;
//         const rate = outputs[0].value;
//         points[i][j] = rate;
//       })
//     });
//     return drawImage(points);
//   }
//   postMessage({img: generateImg()});
//   myBPNN.keepTraining({trainTimes: 4000, testTimes: 1000, limit: 0.99, minE: 0, onTrainInterval: () => {
//     const img = generateImg();
//     postMessage({img});
//   }});
//   myBPNN.keepTesting(10000);
// }

onmessage = (event) => {
  const generateImg = () => {
    const points = _.range(0, 100).map((x) => (_.range(0, 100)));
    const {inputs, outputs} = smallBPNN3.expressions;
    points.forEach((arr, i) => {
      arr.forEach((item, j) => {
        inputs[0].value = j - 50;
        inputs[1].value = 50 - i;
        // inputs[0].value = (j - 50) * (j - 50) / 2500;
        // inputs[1].value = (50 - i) * (50 - i) / 2500;
        const rate = outputs[0].value;
        points[i][j] = rate;
      })
    });
    return drawImage(points);
  }
  postMessage({img: generateImg()});
  smallBPNN3.keepTraining({trainTimes: 4000, testTimes: 1000, limit: 1, minE: 0, onTrainInterval: () => {
    const img = generateImg();
    postMessage({img});
  }});
  smallBPNN3.keepTesting(10000);
}

const test = {name: 'rhqD'};
export default test;
