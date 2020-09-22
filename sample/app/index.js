import forEach from 'lodash/forEach';
import Worker from './nn.worker.js';
import Node from '../../rhqD/Node';

forEach(Node.functions, (v, k) => {
  window[k] = v;
});
window.varb = Node.varb;
window.constant = Node.constant;

const layout = {
  title: 'Mt Bruno Elevation',
  scene: {camera:{eye: {x: 1.87, y: 0.88, z: 0.64}}},
  autosize: false,
  width: 500,
  height: 500,
  margin: {
    l: 65,
    r: 50,
    b: 65,
    t: 90,
  }
};

const iniPoints = _.range(0, 100).map(() => (_.range(0, 100).map(() => (0))));

const iniData = [{
  z: iniPoints,
  type: 'surface',
  contours: {
    z: {
      show:true,
      usecolormap: true,
      highlightcolor:"#42f462",
      project:{z: true}
    }
  }
}];

Plotly.newPlot('plotlyHost', iniData, layout, {showSendToCloud: true});

const presetSamples = {
  xor: 'xor',
  circle: 'circle',
  doubleCircle: 'doubleCircle',
  doubleBola: 'doubleBola',
  ellipse: 'ellipse',
};

window.onload = () => {
  const canv = document.getElementById('canvas1');
  const ctx = canv.getContext('2d');
  const worker = new Worker();
  worker.onmessage = (event) => {
    const {img, points, finished} = event.data;
    ctx.putImageData(img, 0, 0);
    iniData[0].z = points;
    Plotly.redraw('plotlyHost');
  }
  worker.postMessage({
    inr: 'start',
    NN: presetSamples.ellipse,
  });
}


