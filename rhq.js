const rhq = {};
rhq.generate = (tensor, ...args) => {
  args.forEach((arg, index) => {
    arg.argumentIndex = index;
  });
  return {
    v: rhq.generateValueFunc(tensor, args)
  };
}

rhq.generateValueFunc = (tensor, args) => {
  const childFuncs = tensor.varbs.map((item) => {
    const targetItem = _.find(args, (arg) => (arg === item));
    if (!_.isEmpty(targetItem)){
      return (...targs) => (targetItem.op(targs[targetItem.argumentIndex]));
    }
    return rhq.generateValueFunc(item, args);
  });
  return (...args) => {
    const genedFuncs = childFuncs.map(func => (func(...args)));
    return tensor.op(...genedFuncs);
  };
};

rhq.var = () => {
  const x = {
    op: (v) => (v)
  };
  x.varbs = [x];
  return x;
}

rhq.const = (x) => ({
  op: () => (x),
  varbs: []
});
