const _ = require('lodash');
const imageMap = (imgData, mapFunc) => {
  return imgData.map((rows) => (rows.map(mapFunc)));
}

const applyMatrix2Image = (imgData, matrix, channels) => {
  const Im = imgData.length;
  const In = imgData[0].length;
  const m = matrix.length;
  const n = matrix[0].length;
  if (!_.isArray(channels)){
    channels = [channels];
  }
  const weights = _.flatten(matrix);
  const result = [];
  for (let i = 0; i < Im - m; i++){
    result[i] = [];
    for (let j = 0; j < In - n; j++){
      const targetArea = getTargetArea(imgData, i, j, m, n);
      result[i][j] = dotProduct(_.flatten(targetArea), weights, channels);
    }
  }
  return result;
}

const getTargetArea = (imgData, i, j, m, n) => {
  return _.slice(imgData, i, i + n).map((row) => (_.slice(row, j, j + m)));
}

const dotProduct = (a, b, channels) => {
  const init = {};
  channels.forEach((channel) => {
    init[channel] = 0;
  });
  return a.reduce((f, c, index) => {
    const result = {};
    channels.forEach((channel) => {
      result[channel] = f[channel] + c[channel] * b[index];
    });
    return result;
  }, init);
};

const imageFileToDataUrl = (file) => {
  const oReader = new FileReader();
  return new Promise((resolve, reject) => {
    oReader.onload = () => {
      resolve(oReader.result);
    }
    oReader.readAsDataURL(file);
  });
}

const srcToMatrix = (src) => {
  const img = new Image();
  return new Promise((resolve, reject) => {
    img.onload = (e) => {
      const w = img.width;
      const h = img.height;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, w, h).data;
      const result = [];
      for (let i = 0; i < h; i++){
        result[i] = [];
        for(let j = 0; j < w; j++){
          const start = (w * i + j) * 4;
          result[i][j] = {
            r: data[start],
            g: data[start + 1],
            b: data[start + 2],
            a: data[start + 3]
          };
        }
      }
      resolve(result);
    };
    img.src = src;
  });
}

const imageFileToMatrix = (file) => {
  return imageFileToDataUrl(file).then((url) => {
    return srcToMatrix(url);
  });
}

const imgMatrixToImageData = (imgM) => {
  const result = new ImageData(imgM[0].length, imgM.length);
  _.flatten(imgM).forEach(({r, g, b, a = 255}, index) => {
    const start = index * 4;
    result.data[start] = r;
    result.data[start + 1] = g;
    result.data[start + 2] = b;
    result.data[start + 3] = a;
  });
  return result;
}

const imgDataToDataUrl = (imgData) => {
  const canv = document.createElement('canvas');
  canv.width = imgData.width;
  canv.height = imgData.height;
  const ctx = canv.getContext('2d');
  ctx.putImageData(imgData, 0, 0);
  return canv.toDataURL('image/jpeg', 0.8);
}

const sub = (ima, imb, channels = ['r', 'g', 'b']) => {
  return ima.map((item, i) => (item.map((it, j) => {
    const result = {};
    channels.forEach((key) => {
      result[key] = it[key] - imb[i][j][key];
    })
    return result;
  })))
}

export {
  sub,
  imageMap,
  srcToMatrix,
  imgDataToDataUrl,
  imageFileToMatrix,
  applyMatrix2Image,
  imageFileToDataUrl,
  imgMatrixToImageData
}
