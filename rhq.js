const rhq = {};
rhq.getValueFunc = (tensor, ...args) => {
  args.forEach((arg, index) => {
    arg.argumentIndex = index;
  });
  return rhq.generateValueFunc(tensor, args);
}

rhq.getDiffTensor = (tensor, arg) => {
  if (tensor === arg){
    return rhq.const(1);
  }
  let result = rhq.const(0);
  tensor.varbs.forEach((subTensor, index) => {
    result = add(result, mul(tensor.diffs[index], rhq.getDiffTensor(subTensor, arg)));
  });
  return result;
}

rhq.generateValueFunc = (tensor, args) => {
  const targetItem = _.find(args, (arg) => (arg === tensor));
  if (!_.isEmpty(targetItem)){
    //如果当前节点是参数表中的变量，则不在下溯，直接返回
    return (...targs) => (targs[targetItem.argumentIndex]);
  }
  //如果当前节点不是参数表中的变量，则继续下溯
  const childFuncs = tensor.varbs.map((item) => {
    return rhq.generateValueFunc(item, args);
  });
  return (...args) => {
    const genedFuncs = childFuncs.map(func => (func(...args)));
    const result = tensor.op(...genedFuncs);
    if (_.isNaN(result)){
      console.log(tensor);
      console.log(`args: ${genedFuncs}`);
    }
    return result;
  };
};

rhq.var = (name) => ({
  varbs: [],
  name
})

rhq.const = (x) => ({
  op: () => (x),
  varbs: [],
  get name(){
    return `CONSTANT ${this.value}`;
  }
});
