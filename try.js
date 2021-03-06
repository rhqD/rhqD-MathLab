
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
  [rhq.var('w1[0][0]'), rhq.var('w1[0][1]'), rhq.var('w1[0][2]'), rhq.var('w1[0][3]')],
  [rhq.var('w1[1][0]'), rhq.var('w1[1][1]'), rhq.var('w1[1][2]'), rhq.var('w1[1][3]')],
  [rhq.var('w1[2][0]'), rhq.var('w1[2][1]'), rhq.var('w1[2][2]'), rhq.var('w1[2][3]')]
];

const w2 = [
  [rhq.var('w2[0][0]'), rhq.var('w2[0][1]'), rhq.var('w2[0][2]'), rhq.var('w2[0][3]')],
  [rhq.var('w2[1][0]'), rhq.var('w2[1][1]'), rhq.var('w2[1][2]'), rhq.var('w2[1][3]')],
  [rhq.var('w2[2][0]'), rhq.var('w2[2][1]'), rhq.var('w2[2][2]'), rhq.var('w2[2][3]')],
  [rhq.var('w2[3][0]'), rhq.var('w2[3][1]'), rhq.var('w2[3][2]'), rhq.var('w2[3][3]')],
  [rhq.var('w2[4][0]'), rhq.var('w2[4][1]'), rhq.var('w2[4][2]'), rhq.var('w2[4][3]')]
];

const w3 = [
  [rhq.var('w3[0][0]'), rhq.var('w3[0][1]')],
  [rhq.var('w3[1][0]'), rhq.var('w3[1][1]')],
  [rhq.var('w3[2][0]'), rhq.var('w3[2][1]')],
  [rhq.var('w3[3][0]'), rhq.var('w3[3][1]')],
  [rhq.var('w3[4][0]'), rhq.var('w3[4][1]')]
];

const wv1 = [
  [{value: -0.49286370072873464},{value: 0.0944717794370245},{value: 7.9271633833939825},{value: 7.9271633833939825}],
  [{value: 5.741695880965794},{value: 10.11329849762234},{value: 0.042958283253492664},{value: 0.042958283253492664}],
  [{value: 0.8323453406170885},{value: 0.9891034732707417},{value: 0.9719366873142862},{value: 0.9719366873142862}]
];

const wv2 = [
  [{value: 4.45255987628176},{value: 1.910414983985832},{value: 3.0988561545795337},{value: 3.0988561545795337}],
  [{value: 5.456450920741066},{value: -4.698075839044019},{value: 3.03979043884555},{value: 3.03979043884555}],
  [{value: -3.1143040682283996},{value: 4.23722564401026},{value: 3.0831729184789785},{value: 3.0831729184789785}],
  [{value: -3.1143040682283996},{value: 4.23722564401026},{value: 3.0831729184789785},{value: 3.0831729184789785}],
  [{value: 2.432524468004812},{value: -1.6650172796923433},{value: -1.6120232544920157},{value: -1.6120232544920157}]
];

const wv3 = [
  [{value: 5.447450948451574},{value: -4.9253565721313155}],
  [{value: 1},{value: 1}],
  [{value: -3.6241404364232386},{value: 3.29760031670448}],
  [{value: -3.6241404364232386},{value: 3.29760031670448}],
  [{value: -0.9016241268422507},{value: 0.6851688757375717}]
];

//学习速度
const step = 0.005;

const minE = 0.00000005;

const generateTensor = ({x, y, value: {t1, t2}}) => {
  const vars = [];
  vars.push(rhq.const(x));
  vars.push(rhq.const(y));
  vars.push(rhq.const(1));
  const argsList = _.flatten(_.flatten([w1, w2, w3]));
  argsList.forEach((item, index) => {
    item.guid = index;
  });
  const argValuesList = _.flatten(_.flatten([wv1, wv2, wv3]));
  const argValues = argValuesList.map(({value}) => (value));
  vars[0].guid = 42;
  vars[1].guid = 43;
  vars[2].guid = 44;
  const netH11 = sum(mul(vars[0], w1[0][0]), mul(vars[1], w1[1][0]), mul(vars[2], w1[2][0]));
  netH11.guid = 45;
  const netH12 = sum(mul(vars[0], w1[0][1]), mul(vars[1], w1[1][1]), mul(vars[2], w1[2][1]));
  netH12.guid = 46;
  const netH13 = sum(mul(vars[0], w1[0][2]), mul(vars[1], w1[1][2]), mul(vars[2], w1[2][2]));
  netH13.guid = 47;
  const netH14 = sum(mul(vars[0], w1[0][3]), mul(vars[1], w1[1][3]), mul(vars[2], w1[2][3]));
  netH14.guid = 48;
  const outH11 = sigmod(netH11);
  outH11.guid = 49;
  const outH12 = sigmod(netH12);
  outH12.guid = 50;
  const outH13 = sigmod(netH13);
  outH13.guid = 51;
  const outH14 = sigmod(netH14);
  outH14.guid = 52;
  const outH15 = rhq.const(1);
  outH15.guid = 53;
  const netH21 = sum(mul(outH11, w2[0][0]), mul(outH12, w2[1][0]), mul(outH13, w2[2][0]), mul(outH14, w2[3][0]), mul(outH15, w2[4][0]));
  netH21.guid = 54;
  const netH22 = sum(mul(outH11, w2[0][1]), mul(outH12, w2[1][1]), mul(outH13, w2[2][1]), mul(outH14, w2[3][1]), mul(outH15, w2[4][1]));
  netH22.guid = 55;
  const netH23 = sum(mul(outH11, w2[0][2]), mul(outH12, w2[1][2]), mul(outH13, w2[2][2]), mul(outH14, w2[3][2]), mul(outH15, w2[4][2]));
  netH23.guid = 56;
  const netH24 = sum(mul(outH11, w2[0][3]), mul(outH12, w2[1][3]), mul(outH13, w2[2][3]), mul(outH14, w2[3][3]), mul(outH15, w2[4][3]));
  netH24.guid = 57;
  const outH21 = sigmod(netH21);
  outH21.guid = 58;
  const outH22 = sigmod(netH22);
  outH22.guid = 59;
  const outH23 = sigmod(netH23);
  outH23.guid = 60;
  const outH24 = sigmod(netH24);
  outH24.guid = 61;
  const outH25 = rhq.const(1);
  outH25.guid = 62;
  const netO1 = sum(mul(outH21, w3[0][0]), mul(outH22, w2[1][0]), mul(outH23, w3[2][0]), mul(outH24, w3[3][0]), mul(outH25, w3[4][0]));
  netO1.guid = 63;
  const netO2 = sum(mul(outH21, w3[0][1]), mul(outH22, w2[1][1]), mul(outH23, w3[2][1]), mul(outH24, w3[3][1]), mul(outH25, w3[4][1]));
  netO2.guid = 64;
  const outO1 = sigmod(netO1);
  outO1.guid = 65;
  const outO2 = sigmod(netO2);
  outO2.guid = 66;
  return {outO1, outO2, t1, t2, argsList, argValues, argValuesList};
}

const train = (sample) => {
  const {outO1, outO2, t1, t2, argsList, argValues, argValuesList} = generateTensor(sample);
  const e1 = minus(rhq.const(t1), outO1);
  e1.guid = 67;
  const e2 = minus(rhq.const(t2), outO2);
  e2.guid = 68;
  const E = div(add(square(e1), square(e2)), rhq.const(2));
  E.guid = 69;
  const e1V = rhq.getValueFunc(outO1, ...argsList)(...argValues);
  const e2V = rhq.getValueFunc(outO2, ...argsList)(...argValues);
  v = rhq.getValueFunc(E, ...argsList);
  EValue = v(...argValues);
  if (EValue > minE){
    //误差大于预设阀值,进行反向传播
    const dfTable = {};
    argsList.forEach((arg, index) => {
      const dvTensor = rhq.getDiffTensor(E, arg, dfTable);
      const dvFunc = rhq.getValueFunc(dvTensor, ...argsList);
      const dv = dvFunc(...argValues);
      argValuesList[index].value = argValues[index] - dv * step;
    });
  } else {
    console.log('no');
  }
  return EValue;
}

const trainIt = (times = 0) => {
  // console.log('begin training');
  for (let i = 0; i < times; i++){
    train(generateSample());
    // if (i % 10 === 0){
    //   console.clear();
    //   console.log(`${(i/times) * 100}%`);
    // }
  }
  // console.log('end training');
};

const keepTraining = (limit) => {
  let trainedTimes = 0;
  let accuracy = 0;
  console.log('begin training');
  while(accuracy < limit){
    trainIt(500);
    accuracy = testIt(10000);
  }
  console.log('*********************** succeed ******************************');
}

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

const test = (sample) => {
  const {outO1, outO2, t1, t2, argsList, argValues, argValuesList} = generateTensor(sample);
  const outPut1 = rhq.getValueFunc(outO1, ...argsList)(...argValues);
  const outPut2 = rhq.getValueFunc(outO2, ...argsList)(...argValues);
  if (_.isNaN(outPut1) || _.isNaN(outPut2)){
    console.error('NaN during test');
    return null;
  }
  return (outPut1 >= outPut2 && t1 === 1) || (outPut1 < outPut2 && t2 === 1 );
}

const testIt = (times = 0) => {
  let total = 0;
  let success = 0;
  let fail = 0;
  let error = 0;
  console.log('begin testing');
  for (let i = 0; i < times; i++){
    const result = test(generateSample());
    if (result === null){
      error++;
    } else if (result){
      total++;
      success++;
    } else {
      total++;
      fail++;
    }
  }
  console.log('end testing');
  console.log(`accuracy: ${success / total} || total: ${total} || success: ${success} || fail: ${fail} || error: ${error}`);
  return success / total;
}
// testIt(10000);
keepTraining(0.9995);
// testIt(10000);
