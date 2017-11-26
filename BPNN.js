class BPNN {
  static generateValueMatrix(mi, mj, random){
    let result = [];
    for(let i = 0; i < mi; i++){
      for(let j = 0; j < mj; j++){
        _.set(result, [i, j], {value: _.isFunction(random) ? random() : Math.random()});
      }
    }
    return result;
  };

  static generateVarMatrix(mi, mj, name = ''){
    let result = [];
    for(let i = 0; i < mi; i++){
      for(let j = 0; j < mj; j++){
        _.set(result, [i, j], rhq.var(`${name}[${i}][${j}]`));
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

  constructor({input, hls, output, random, step = 0.5, minE = 0}){
    this.inputCount = input;
    this.outputCount = output;
    this.hls = hls;
    this.step = step;
    this.minE = minE;
    this.msModal = [];
    let si = input + 1;
    [...hls, output].forEach((layserSize, index) => {
      this.msModal.push(BPNN.generateValueMatrix(si, layserSize, random));
      si = layserSize + 1;
    });
    this.updateValuesFunc();
  }

  train({inputs, expects}){
    const {m1, ms, LayerOutputs, LayerInputs} = this.getOutputsVaryWithms(inputs);
    const v1 = _.last(LayerOutputs)[0];
    const v2 = expects.map((outputItem) => (rhq.const(outputItem)));
    const E = BPNN.getE(v1, v2);
    const args = _.flatten(_.flatten(_.flatten(ms)));
    const argValuesList = _.flatten(_.flatten(_.flatten(this.msModal)));
    const argValues = argValuesList.map((item) => (item.value))
    const EValue = rhq.getValueFunc(E, ...args)(...argValues);
    if (EValue > this.minE){
      //后向传播
      const dfTable = {};
      args.forEach((arg, index) => {
        const dvTensor = rhq.getDiffTensor(E, arg, dfTable);
        const dvFunc = rhq.getValueFunc(dvTensor, ...args);
        const dv = dvFunc(...argValues);
        argValuesList[index].value = argValues[index] - dv * this.step;
      });
    } else {
      console.log('小于最小方差, 不用调整');
    }
    if (_.isFunction(this.onTrained)){
      this.onTrained(this, EValue);
    }
  }

  getOutputsVaryWithInputs(){
    const inputs = [_.range(0, this.inputCount).map((index) => (rhq.var(`input${index}`)))];
    const ms = this.msModal.map((m) => (m.map((row) => (row.map((item) => (rhq.const(item.value)))))));
    /***前向传播***/
    let guid = 1;
    const LayerOutputs = [];
    const LayerInputs = [];
    inputs[0].push(rhq.const(1));
    LayerOutputs.push(inputs);
    ms.forEach((m, index) => {
      const lIn = mm(LayerOutputs[index], m);
      LayerInputs.push(lIn);
      const lOut = sigmodM(lIn);//应该是一个1*x的矩阵
      if (index < (ms.length - 1)){
        lOut[0].push(rhq.const(1));
      }
      LayerOutputs.push(lOut);
    });
    //给所有变量添加GUID
    inputs.forEach((item) => {item.forEach((subItem) => {subItem.guid = guid++;});});
    ms.forEach((m) => {m.forEach((item) => {item.forEach((subItem) => {subItem.guid = guid++;});});});
    LayerOutputs.forEach((m) => {m.forEach((item) => {item.forEach((subItem) => {subItem.guid = guid++;});});});
    LayerInputs.forEach((m) => {m.forEach((item) => {item.forEach((subItem) => {subItem.guid = guid++;});});});
    return {inputs, ms, LayerOutputs, LayerInputs};
  }

  updateValuesFunc(){
    const {inputs, ms, LayerOutputs} = this.getOutputsVaryWithInputs();
    const args = _.flatten(_.flatten(_.flatten(inputs)));
    args.pop();
    const outputs = _.last(LayerOutputs)[0];
    this.values = (...argValues) => (outputs.map((item) => (rhq.getValueFunc(item, ...args)(...argValues))));
  }

  getOutputsVaryWithms(inputs){
    if (inputs.length !== this.inputCount){
      throw('illegal inputs length');
    }
    let guid = 1;
    const ms = [];
    //构造输入矩阵
    const m1 = [inputs.map((inputsItem) => (rhq.const(inputsItem)))];
    let mi = this.inputCount + 1;
    //构造权重矩阵
    [...this.hls, this.outputCount].forEach((layerSize, index) => {
      ms.push(BPNN.generateVarMatrix(mi, layerSize, `w${index}`));
      mi = layerSize + 1;
    });
    /***前向传播***/
    const LayerOutputs = [];
    const LayerInputs = [];
    m1[0].push(rhq.const(1));
    LayerOutputs.push(m1);
    ms.forEach((m, index) => {
      const lIn = mm(LayerOutputs[index], m);
      LayerInputs.push(lIn);
      const lOut = sigmodM(lIn);//应该是一个1*x的矩阵
      if (index < (ms.length - 1)){
        lOut[0].push(rhq.const(1));
      }
      LayerOutputs.push(lOut);
    });
    //给所有变量添加GUID
    m1.forEach((item) => {item.forEach((subItem) => {subItem.guid = guid++;});});
    ms.forEach((m) => {m.forEach((item) => {item.forEach((subItem) => {subItem.guid = guid++;});});});
    LayerOutputs.forEach((m) => {m.forEach((item) => {item.forEach((subItem) => {subItem.guid = guid++;});});});
    LayerInputs.forEach((m) => {m.forEach((item) => {item.forEach((subItem) => {subItem.guid = guid++;});});});
    return {m1, ms, LayerOutputs, LayerInputs};
  }
}
