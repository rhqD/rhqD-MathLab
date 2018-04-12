// require('../../test');
// require('../../tryBPNN');
// var nnWorker = require("worker-loader!./nn.worker");
import Worker from './nn.worker.js';
import {imageFileToDataUrl, srcToMatrix, applyMatrix2Image, imageMap, imgMatrixToImageData, imgDataToDataUrl} from '../../imageProcessing/utils';
window.onload = () => {
  const canv = document.getElementById('canvas1');
  const ctx = canv.getContext('2d');
  // const worker = new Worker();
  // worker.onmessage = (event) => {
  //   const {img} = event.data;
  //   ctx.putImageData(img, 0, 0);
  // }
  // worker.postMessage({inr: 'start'});

  const fileInput = document.getElementById('fileInput');
  const originalImg = document.getElementById('original');
  const processedImg = document.getElementById('processed');
  fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file){
      imageFileToDataUrl(file).then((src) => {
        originalImg.src = src;
        srcToMatrix(src).then((imgM) => {
          //高斯模糊
          // const matrix = [
          //   [1/273, 4/273, 7/273, 4/273, 1/273],
          //   [4/273, 16/273, 26/273, 16/273, 4/273],
          //   [7/273, 26/273, 41/273, 26/273, 7/273],
          //   [4/273, 16/273, 26/273, 16/273, 4/273],
          //   [1/273, 4/273, 7/273, 4/273, 1/273]
          // ];
          // // //浮雕
          // const matrix = [
          //   [-1, -1, 0],
          //   [-1, 0, 1],
          //   [0, 1, 1]
          // ];
          // //强调边缘
          // const matrix = [
          //   [1, 1, 1],
          //   [1, -7, 1],
          //   [1, 1, 1]
          // ];
          // //边缘检测（3x3卷积核）
          // const matrix = [
          //   [-1, -1, -1],
          //   [-1, 8, -1],
          //   [-1, -1, -1]
          // ];
          //边缘检测（5x5卷积核）
          // const matrix = [
          //   [-1, -1, -1, -1, -1],
          //   [-1, -1, -1, -1, -1],
          //   [-1, -1, 24, -1, -1],
          //   [-1, -1, -1, -1, -1],
          //   [-1, -1, -1, -1, -1]
          // ];
          //均值滤波
          const matrix = [
            [1/9, 1/9, 1/9],
            [1/9, 1/9, 1/9],
            [1/9, 1/9, 1/9]
          ];
          // const grayImg = imageMap(imgM, (item) => {
          //   const {r, g, b} = item;
          //   return {gray: r * 0.299 + g * 0.587 + b * 0.114};
          // });
          // debugger
          // https://www.cnblogs.com/qiqibaby/p/5325193.html
          // const resultM = applyMatrix2Image(imgM, matrix, ['r', 'g', 'b']);
          const gamma = (c, ga = 2.2) => {
            //归一化
            const g = (c + 0.5) / 256;
            //预补偿
            const g2 = Math.pow(g, 1 / ga);
            //反归一
            return g2 * 256 - 0.5;
          };

          const gammaImg = imageMap(imgM, (item) => {
            item.r = gamma(item.r);
            item.g = gamma(item.g);
            item.b = gamma(item.b);
            return item;
          });
          const url = imgDataToDataUrl(imgMatrixToImageData(gammaImg));
          processedImg.src = url;
        })
      })
    }
  }
}
