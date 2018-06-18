import Worker from './nn.worker.js';
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
