const myBPNN = new BPNN({input: 1, hls: [], output: 1, step: 0.01, minE: 0});

const generateSample = () => {
  const x = Math.random() * 100 - 50;
  return {inputs: [x], expects: [x > 10 ? 1 : 0]}
}

const testOnce = () => {
  const {inputs, expects} = generateSample();
  const values = myBPNN.values(...inputs);
  const expect = expects[0];
  const value = values[0];
  if (_.isNaN(value)){
    console.error('NaN during test');
    return null;
  }
  return expect === 1 && value > 0.5 || expect === 0 && value < 0.5;
}

const test = (count = 1) => {
  let total = 0;
  let success = 0;
  let fail = 0;
  let error = 0;
  console.log('begin testing');
  for(let c = 0; c < count; c++){
    const result = testOnce();
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
  console.log(`accuracy: ${success / total} || total: ${total} || success: ${success} || fail: ${fail} || error: ${error}`);
  return success / total;
}

const train = (count = 1) => {
  for(let c = 0; c < count; c++){
    myBPNN.train(generateSample());
  }
  myBPNN.updateValuesFunc();
}

const keepTraining = (limit) => {
  let trainedTimes = 0;
  let accuracy = 0;
  console.log('begin training');
  while(accuracy < limit){
    trainIt(500);
    accuracy = test(10000);
  }
  console.log('*********************** succeed ******************************');
}

train(100000);
test(10000);
