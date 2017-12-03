const rhqD = require('../rhqD');
const {square, minus, sigmod, sum} = rhqD.functions;
const {mm, activateM} = require('../matrix');
const {timeUtils: {getInterval}} = require('../utils');
const _ = require('lodash');
class BPNN {
  // static generateValueMatrix(mi, mj, random){
  //   let result = [];
  //   for(let i = 0; i < mi; i++){
  //     for(let j = 0; j < mj; j++){
  //       _.set(result, [i, j], {value: _.isFunction(random) ? random() : Math.random()});
  //     }
  //   }
  //   return result;
  // };

  static generateVarMatrix(mi, mj, name = ''){
    let result = [];
    for(let i = 0; i < mi; i++){
      for(let j = 0; j < mj; j++){
        _.set(result, [i, j], rhqD.var(`${name}[${i}][${j}]`));
      }
    }
    return result;
  }

  static getE(v1, v2){
    if (v1.length !== v2.length || v1.length === 0){
      throw('illegal vector length at BPNN.getE');
    }
    const es = v1.map((item, index) => (square(minus(item, v2[index]))));
    return sum(...es);
  }

  constructor({input, hls, output, random, step = 0.5, minE = 0, activation = sigmod}){
    this.expressions = {};
    this.inputCount = input;
    this.outputCount = output;
    this.hls = hls;
    this.step = step;
    this.minE = minE;
    this.msModal = [];
    this.activation = activation;
    const {inputs, ms, LayerOutputs} = this.getExpressions();
    this.expressions.inputs = inputs[0];
    this.expressions.ms = ms;
    const outputs = _.last(LayerOutputs)[0];//取最后一层的输出
    this.expressions.outputs = outputs;
    const expects = _.range(0, this.outputCount).map((index) => (rhqD.var(`output${index + 1}`)));
    this.expressions.expects = expects;
    const E = BPNN.getE(outputs, expects);
    this.expressions.E = E;
    const args = _.flatten(_.flatten(_.flatten(ms)));
    const dfTable = {};
    this.dts = args.map((arg) => (rhqD.getDiffTensor(E, arg, dfTable)));
    args.forEach((arg) => {
      arg.value = _.isFunction(random) ? random() : Math.random();
    });
  }

  getExpressions(){
    let guid = 1;
    const ms = [];
    //构造输入矩阵
    const inputs = [_.range(0, this.inputCount).map((index) => (rhqD.var(`input${index + 1}`)))];
    let mi = this.inputCount + 1;
    //构造权重矩阵
    [...this.hls, this.outputCount].forEach((layerSize, index) => {
      ms.push(BPNN.generateVarMatrix(mi, layerSize, `w${index}`));
      mi = layerSize + 1;
    });
    /***前向传播***/
    const LayerOutputs = [];
    const LayerInputs = [];
    const m1 = [[...inputs[0]]];
    m1[0].push(rhqD.const(1));
    LayerOutputs.push(m1);
    ms.forEach((m, index) => {
      const lIn = mm(LayerOutputs[index], m);
      LayerInputs.push(lIn);
      const lOut = activateM(lIn, this.activation);//应该是一个1*x的矩阵
      if (index < (ms.length - 1)){
        lOut[0].push(rhqD.const(1));
      }
      LayerOutputs.push(lOut);
    });
    //给所有变量添加GUID
    m1.forEach((item) => {item.forEach((subItem) => {subItem.guid = guid++;});});
    ms.forEach((m) => {m.forEach((item) => {item.forEach((subItem) => {subItem.guid = guid++;});});});
    LayerOutputs.forEach((m) => {m.forEach((item) => {item.forEach((subItem) => {subItem.guid = guid++;});});});
    LayerInputs.forEach((m) => {m.forEach((item) => {item.forEach((subItem) => {subItem.guid = guid++;});});});
    return {inputs, ms, LayerOutputs, LayerInputs};
  }

  trainOnce(){
    this.trainSampleGeneratorCheck();
    const sampleValues = this.generateTrainSample();
    const {ms} = this.expressions;
    const EValue = this.getEValue(sampleValues);
    const args = _.flatten(_.flatten(_.flatten(ms)));
    if (EValue > this.minE){
      //后向传播
      this.dts.forEach((dt, index) => {
        const dv = dt.value;
        args[index].value = args[index].value - dv * this.step;
      });
    } else {
      console.log(`accurate enough, no need to train with EValue = ${EValue}`);
    }
    if (_.isFunction(this.onTrained)){
      this.onTrained(this, EValue);
    }
  }

  train(count = 1){
    for(let c = 0; c < count; c++){
      // console.log(c);
      this.trainOnce();
    }
  }

  keepTraining({trainTimes = 500, testTimes = 1000, limit = 0.9, onTrainInterval}){
    let trainedTimes = 0;
    let accuracy = 0;
    const startDate = new Date();
    console.log(`begin training at ${startDate}`);
    while(accuracy < limit){
      this.train(trainTimes);
      accuracy = this.keepTesting(testTimes);
      if (_.isFunction(onTrainInterval)){
        onTrainInterval(accuracy);
      }
    }
    const endDate = new Date();
    console.log(`finish training at ${startDate}`);
    console.log('*********************** succeed ******************************');
    console.log(`*********************** takes ${getInterval(startDate, endDate)} ******************************`);
  }

  getOutputs(inputValues){
    const {inputs, outputs} = this.expressions;
    inputs.forEach((input, index) => {
      input.value = inputValues[index];
    });
    return outputs.map((output) => (output.value));
  }

  getEValue(sampleValues){
    const {E, inputs, expects} = this.expressions;
    [...inputs, ...expects].forEach((item, index) => {
      item.value = sampleValues[index];
    });
    return E.value;
  }


  persist(){
    return _.flatten(_.flatten(_.flatten(this.expressions.ms))).map((item) => (item.value)).join(',');
  }

  inject(msValues){
    const {ms} = this.expressions;
    const values = msValues.split(',').map((item) => (_.toNumber(item)));
    const args = _.flatten(_.flatten(_.flatten(ms)));
    if (values.length !== args.length){
      throw('inject fail, please check the length of your values');
    }
    args.forEach((item, index) => {
      item.value = values[index];
    });
  }

  trainSampleGeneratorCheck(){
    if (!_.isFunction(this.generateTrainSample)){
      throw('you need to initilize the generateTrainSample with a method');
    }
  }

  testSampleGeneratorCheck(){
    if (!_.isFunction(this.generateTestSample)){
      throw('you need to initilize the generateTestSample with a method');
    }
  }

  judgeCheck(){
    if (!_.isFunction(this.judge)){
      throw('you need to initilize the judge with a method');
    }
  }

  keepTesting(count = 1){
    let total = 0;
    let success = 0;
    let fail = 0;
    let error = 0;
    console.log(`begin testing at |** ${new Date()} **|`);
    for(let c = 0; c < count; c++){
      const result = this.test();
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
    console.log(`accuracy: ${success / total} || total: ${total} || success: ${success} || fail: ${fail} || error: ${error} at |** ${new Date()} **|`);
    return success / total;
  }

  test(){
    this.testSampleGeneratorCheck();
    this.judgeCheck();
    const sample = this.generateTestSample();
    if (sample.length !== this.inputCount + this.outputCount){
      throw('wrong length of sample');
    }
    const inputs = _.slice(sample, 0, this.inputCount);
    const expects =_.slice(sample, this.inputCount, this.inputCount + this.outputCount);
    const values = this.getOutputs(inputs);
    return this.judge(values, expects);
  }

}

module.exports = BPNN;
