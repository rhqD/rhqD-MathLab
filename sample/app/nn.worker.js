import range from 'lodash/range';
import parseInt from 'lodash/parseInt';
import xorNN from './sampleNNs/xor';
import circleNN from './sampleNNs/circle';
import doubleCircleNN from './sampleNNs/doubleCircle';
import doubleBolaNN from './sampleNNs/doubleBola';
import ellipseNN from './sampleNNs/ellipse';

const NNs = {
  xor: xorNN,
  circle: circleNN,
  doubleCircle: doubleCircleNN,
  doubleBola: doubleBolaNN,
  ellipse: ellipseNN,
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
        img.data[startIndex + 3] = parseInt(510 * (item - 0.5));
      } else {
        img.data[startIndex] = 97;
        img.data[startIndex + 1] = 167;
        img.data[startIndex + 2] = 211;
        img.data[startIndex + 3] = parseInt(510 * (0.5 - item));
      }
    });
  });
  return img;
}

onmessage = ({ data: { NN } }) => {
  const selectedNN = NNs[NN];
  const generateImg = () => {
    const points = range(0, 100).map((x) => (range(0, 100)));
    const {inputs, outputs} = selectedNN.expressions;
    points.forEach((arr, i) => {
      arr.forEach((item, j) => {
        inputs[0].value = i - 50;
        inputs[1].value = 50 - j;
        const rate = outputs[0].value;
        points[i][j] = rate;
      })
    });
    return {img: drawImage(points), points};
  }
  postMessage(generateImg());
  selectedNN.keepTraining({trainTimes: 1000, testTimes: 1000, limit: 0.999, minE: 0, onTrainInterval: (accuracy, finished) => {
    postMessage(Object.assign(generateImg(), {finished}));
  }});
  selectedNN.keepTesting(10000);
}

const test = {name: 'rhqD'};
export default test;
