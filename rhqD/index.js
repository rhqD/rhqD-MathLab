const _ = require('lodash');
const rhqD = {};
rhqD.getValueFunc = (tensor, ...args) => {
  args.forEach((arg, index) => {
    arg.argumentIndex = index;
  });
  const result = rhqD.generateValueFunc(tensor, args);
  args.forEach((arg) => {
    delete arg.argumentIndex;
  });
  return result;
}

rhqD.getDiffTensor = (tensor, arg, table) => {
  const targetTensor = _.get(table, [tensor.guid, arg.guid], null);
  if (targetTensor){
    return targetTensor;
  }
  if (tensor === arg){
    return rhqD.const(1);
  }
  let result = rhqD.const(0);
  tensor.varbs.forEach((subTensor, index) => {
    result = add(result, mul(tensor.diffs[index], rhqD.getDiffTensor(subTensor, arg, table)));
  });
  if (tensor.guid !== undefined && arg.guid !== undefined){
    _.set(table, [tensor.guid, arg.guid], result);
  }
  return result;
}

rhqD.generateValueFunc = (tensor, args) => {
  const targetItem = _.find(args, (arg) => (arg === tensor));
  if (!_.isEmpty(targetItem)){
    //如果当前节点是参数表中的变量，则不在下溯，直接返回
    const argIndex = targetItem.argumentIndex;
    return (...targs) => (targs[argIndex]);
  }
  //如果当前节点不是参数表中的变量，则继续下溯
  const childFuncs = tensor.varbs.map((item) => {
    return rhqD.generateValueFunc(item, args);
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

rhqD.detect = (tensor) => {
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

rhqD.var = (name) => ({
  varbs: [],
  name
})

rhqD.const = (x) => ({
  op: () => (x),
  varbs: [],
  get name(){
    return `CONSTANT ${x}`;
  }
});

/****** functions *******/
//一元函数
const sin = (x) => ({
  op: Math.sin,
  get diffs(){
    if (!_.isArray(this._diffs)){
      this._diffs = [cos(x)];
    }
    return this._diffs;
  },
  varbs: [x]
});

const cos = (x) => ({
  op: Math.cos,
  get diffs(){
    if (!_.isArray(this._diffs)){
      this._diffs = [neg(sin(x))];
    }
    return this._diffs;
  },
  varbs: [x]
});

const arccos = (x) => ({
  op: Math.acos,
  get diffs(){
    if (!_.isArray(this._diffs)){
      this._diffs = [neg(div(rhqD.const(1), pow(minus(rhqD.const(1), pow(x, rhqD.const(2))), rhqD.const(0.5))))];
    }
    return this._diffs;
  },
  varbs: [x]
});

const arcsin = (x) => ({
  op: Math.asin,
  get diffs(){
    if (!_.isArray(this._diffs)){
      this._diffs = [div(rhqD.const(1), pow(minus(rhqD.const(1), pow(x, rhqD.const(2))), rhqD.const(0.5)))];
    }
    return this._diffs;
  },
  varbs: [x]
});

const tan = (x) => ({
  op: Math.tan,
  get diffs(){
    if (!_.isArray(this._diffs)){
      this._diffs = [pow(cos(x), rhqD.const(-2))];
    }
    return this._diffs;
  },
  varbs: [x]
});

const ln = (x) => ({
  op: Math.log,
  get diffs(){
    if (!_.isArray(this._diffs)){
      this._diffs = [div(rhqD.const(1), x)];
    }
    return this._diffs;
  },
  varbs: [x]
});

const exp = (x) => ({
  op: Math.exp,
  get diffs(){
    if (!_.isArray(this._diffs)){
      this._diffs = [exp(x)];
    }
    return this._diffs;
  },
  varbs: [x]
});

const neg = (x) => ({
  op: (v) => (0 - v),
  get diffs(){
    if (!_.isArray(this._diffs)){
      this._diffs = [rhqD.const(-1)];
    }
    return this._diffs;
  },
  varbs: [x]
});

const sigmod = (x) => ({
  op: (v) => (1 / (1 + Math.exp(0 - v))),
  get diffs(){
    if (!_.isArray(this._diffs)){
      this._diffs = [mul(sigmod(x), minus(rhqD.const(1), sigmod(x)))];
    }
    return this._diffs;
  },
  varbs: [x]
});

const square = (x) => ({
  op: (v) => (v * v),
  get diffs(){
    if (!_.isArray(this._diffs)){
      this._diffs = [mul(x, rhqD.const(2))];
    }
    return this._diffs;
  },
  varbs: [x]
});

//二元函数
const pow = (x, y) => ({
  op: (v1, v2) => (Math.pow(v1, v2)),
  get diffs(){
    if (!_.isArray(this._diffs)){
      this._diffs = [mul(y, pow(x, minus(y, rhqD.const(1)))), mul(ln(x), pow(x, y))];
    }
    return this._diffs;
  },
  varbs: [x, y]
});

const add = (x, y) => ({
  op: (v1, v2) => (v1 + v2),
  get diffs(){
    if (!_.isArray(this._diffs)){
      this._diffs = [rhqD.const(1), rhqD.const(1)];
    }
    return this._diffs;
  },
  varbs: [x, y],
});

const minus = (x, y) => ({
  op: (v1, v2) => (v1 - v2),
  get diffs(){
    if (!_.isArray(this._diffs)){
      this._diffs = [rhqD.const(1), rhqD.const(-1)];
    }
    return this._diffs;
  },
  varbs: [x, y]
});

const mul = (x, y) => ({
  op: (v1, v2) => (v1 * v2),
  get diffs(){
    if (!_.isArray(this._diffs)){
      this._diffs = [y, x];
    }
    return this._diffs;
  },
  varbs: [x, y]
});

const div = (x, y) => ({
  op: (v1, v2) => (v1 / v2),
  get diffs(){
    if (!_.isArray(this._diffs)){
      this._diffs = [div(rhqD.const(1), y), neg(mul(x, pow(y, rhqD.const(-2))))];
    }
    return this._diffs;
  },
  varbs: [x, y]
});

const log = (x, y) => ({
  op: (v1, v2) => (Math.log(v2) / Math.log(v1)),
  get diffs(){
    if (!_.isArray(this._diffs)){
      this._diffs = [div(mul(ln(y), pow(ln(x), rhqD.const(-2))), x), div(rhqD.const(1), mul(ln(x), ln(y)))];
    }
    return this._diffs;
  },
  varbs: [x, y]
});
//辅助方法
const sum = (...args) => {
  if (!_.isArray(args) || args.length === 0){
    throw('cant sum nothing');
  }
  let result = args[0];
  const len = args.length;
  for(let i = 1; i < len; i++){
    result = add(result, args[i]);
  }
  return result;
}

rhqD.functions = {
  sin,
  cos,
  arccos,
  arcsin,
  tan,
  ln,
  exp,
  neg,
  sigmod,
  square,
  pow,
  add,
  minus,
  mul,
  div,
  log,
  sum
}

module.exports = rhqD;
