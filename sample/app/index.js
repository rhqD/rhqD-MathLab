import forEach from 'lodash/forEach';
import Worker from './nn.worker.js';
import Node from '../../rhqD/Node';

forEach(Node.functions, (v, k) => {
  window[k] = v;
});
window.varb = Node.varb;

window.onload = () => {
  const canv = document.getElementById('canvas1');
  const ctx = canv.getContext('2d');
  const worker = new Worker();
  worker.onmessage = (event) => {
    const {img} = event.data;
    ctx.putImageData(img, 0, 0);
  }
  worker.postMessage({inr: 'start'});
}
