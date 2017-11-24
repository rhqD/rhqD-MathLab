
const x = rhq.var();
const y = rhq.var();

const const2 = rhq.const(2);
const const1 = rhq.const(1);

const sinx = sin(x);
const cosy = cos(y);
const z = mul(sinx, sinx);
const d = rhq.getDiffTensor(z, x);
const dv = rhq.getValueFunc(d, x);
// const d = rhq.getDiffTensor(z, x);
// const dv = rhq.getValueFunc(d, x, y);

const typeMapper = [1, 2, 2, 1]

const generateSample = () => {
  const x = Math.random() * 100 - 50;
  const y = Math.random() * 100 - 50;
  const area = (x >= 0 ? 2 : 0) + (y >= 0 ? 1 : 0);
  return {
    x,
    y,
    value: {
      t1: (area === 0 || area === 3) ? 1 : 0,
      t2: (area === 1 || area === 2) ? 1 : 0
    }
  };
}

const w1 = [
  [rhq.var('w1[0][0]'), rhq.var('w1[0][1]'), rhq.var('w[0][2]')],
  [rhq.var('w1[1][0]'), rhq.var('w1[1][1]'), rhq.var('w[1][2]')]
];

const w2 = [
  [rhq.var('w2[0][0]'), rhq.var('w2[0][1]'), rhq.var('w2[0][2]')],
  [rhq.var('w2[1][0]'), rhq.var('w2[1][1]'), rhq.var('w2[1][2]')]
];

const wv1 = [
  [1,1,1],
  [1,1,1]
];

const wv2 = [
  [1,1,1],
  [1,1,1]
];

const train = ({x, y, value: {t1, t2}}) => {
  const vars = [];
  vars.push(rhq.const(x));
  vars.push(rhq.const(y));
  vars.push(rhq.const(1));
  const netH1 = sum(mul(vars[0], w1[0][0], mul(vars[1], w1[0][1]), mul(vars[2], w1[0][2])));
  const netH2 = sum(mul(vars[0], w1[1][0], mul(vars[1], w1[1][1]), mul(vars[2], w1[1][2])));
  const outH1 = sigmod(netH1);
  const outH2 = sigmod(netH2);
  const outH3 = rhq.const(1);
  const netO1 = sum(mul(outH1, w2[0][0]), mul(outH2, w2[0][1]), mul(outH3, w2[0][2]));
  const netO2 = sum(mul(outH1, w2[1][0]), mul(outH2, w2[1][1]), mul(outH3, w2[1][2]));
  const outO1 = sigmod(netO1);
  const outO2 = sigmod(netO2);
  const e1 = minus(rhq.const(t1), outO1);
  const e2 = minus(rhq.const(t2), outO2);
  const E = div(add(pow(e1, const2), pow(e2, rhq.const(2))), rhq.const(2));
  const argsList = _.flatten(_.flatten([w1, w2]));
  const argValuesList = _.flatten(_.flatten([wv1, wv2]));
  v = rhq.getValueFunc(E, ...argsList);
  EValue = v(...argValuesList);
  debugger
  detect(E);
}

const trainIt = (times = 0) => {
  for (i = 0; i< times; i++){
    train(generateSample());
  }
};

const detect = (tensor) => {
  if (tensor.varbs.length > 0 && _.find(tensor.varbs, (item) => (!_.isObject(item))) !== undefined){
    console.error(tensor);
    return;
  }
  let result = null;
  const len = tensor.varbs.length;
  for(let i = 0; i < len; i++){
    detect(tensor.varbs[i]);
  }
  return;
}

trainIt(1);
