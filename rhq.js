const rhq = {};
rhq.getValueFunc = (tensor, ...args) => {
  args.forEach((arg, index) => {
    arg.argumentIndex = index;
  });
  const result = rhq.generateValueFunc(tensor, args);
  args.forEach((arg) => {
    delete arg.argumentIndex;
  });
  return result;
}

rhq.getDiffTensor = (tensor, arg, table) => {
  const targetTensor = _.get(table, [tensor.guid, arg.guid], null);
  if (targetTensor){
    return targetTensor;
  }
  if (tensor === arg){
    return rhq.const(1);
  }
  let result = rhq.const(0);
  tensor.varbs.forEach((subTensor, index) => {
    result = add(result, mul(tensor.diffs[index], rhq.getDiffTensor(subTensor, arg, table)));
  });
  if (tensor.guid !== undefined && arg.guid !== undefined){
    _.set(table, [tensor.guid, arg.guid], result);
  }
  return result;
}

rhq.generateValueFunc = (tensor, args) => {
  const targetItem = _.find(args, (arg) => (arg === tensor));
  if (!_.isEmpty(targetItem)){
    //如果当前节点是参数表中的变量，则不在下溯，直接返回
    const argIndex = targetItem.argumentIndex;
    return (...targs) => (targs[argIndex]);
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
    return `CONSTANT ${x}`;
  }
});
