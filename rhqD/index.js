const _ = require('lodash');
const Node = require('./Node');
const rhqD = {};
// rhqD.getValueFunc = (tensor, ...args) => {
//   args.forEach((arg, index) => {
//     arg.argumentIndex = index;
//   });
//   const result = rhqD.generateValueFunc(tensor, args);
//   args.forEach((arg) => {
//     delete arg.argumentIndex;
//   });
//   return result;
// }

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

// rhqD.generateValueFunc = (tensor, args) => {
//   const targetItem = _.find(args, (arg) => (arg === tensor));
//   if (!_.isEmpty(targetItem)){
//     //如果当前节点是参数表中的变量，则不在下溯，直接返回
//     const argIndex = targetItem.argumentIndex;
//     return (...targs) => (targs[argIndex]);
//   }
//   //如果当前节点不是参数表中的变量，则继续下溯
//   const childFuncs = tensor.varbs.map((item) => {
//     return rhqD.generateValueFunc(item, args);
//   });
//   return (...args) => {
//     const genedFuncs = childFuncs.map(func => (func(...args)));
//     const result = tensor.op(...genedFuncs);
//     if (_.isNaN(result)){
//       console.log(tensor);
//       console.log(`args: ${genedFuncs}`);
//     }
//     return result;
//   };
// };

// rhqD.detect = (tensor) => {
//   if (tensor.varbs.length > 0 && _.find(tensor.varbs, (item) => (!_.isObject(item))) !== undefined){
//     console.error(tensor);
//     return;
//   }
//   let result = null;
//   const len = tensor.varbs.length;
//   for(let i = 0; i < len; i++){
//     detect(tensor.varbs[i]);
//   }
//   return;
// }

rhqD.var = (name) => {
  const p = new Node({name, isConstant: true});
  return p;
};

rhqD.const = (x) => {
  const p = new Node({
    op: () => (x),
    value: x,
    varbs: [],
    isConstant: true,
    caculated: true
  });
  return p;
};

/****** functions *******/
//一元函数

const sin = (x) => {
  const p = new Node({op: Math.sin, varbs: [x], diffGetters: [(x) => (cos(x))]});
  x.fathers.push(p);
  return p;
};

const cos = (x) => {
  const p = new Node({op: Math.cos, varbs: [x], diffGetters: [(x) => (neg(sin(x)))]});
  x.fathers.push(p);
  return p;
};

const arccos = (x) => {
  const p = new Node({op: Math.acos, varbs: [x], diffGetters: [(x) => (neg(div(rhqD.const(1), pow(minus(rhqD.const(1), pow(x, rhqD.const(2))), rhqD.const(0.5)))))]});
  x.fathers.push(p);
  return p;
};

const arcsin = (x) => {
  const p = new Node({op: Math.asin, varbs: [x], diffGetters: [(x) => (div(rhqD.const(1), pow(minus(rhqD.const(1), pow(x, rhqD.const(2))), rhqD.const(0.5))))]});
  x.fathers.push(p);
  return p;
};

const tan = (x) => {
  const p = new Node({op: Math.tan, varbs: [x], diffGetters: [(x) => (pow(cos(x), rhqD.const(-2)))]});
  x.fathers.push(p);
  return p;
};

const ln = (x) => {
  const p = new Node({op: Math.log, varbs: [x], diffGetters: [(x) => (div(rhqD.const(1), x))]});
  x.fathers.push(p);
  return p;
}

const exp = (x) => {
  const p = new Node({op: Math.exp, varbs: [x], diffGetters: [(x) => (exp(x))]});
  x.fathers.push(p);
  return p;
}

const neg = (x) => {
  const p = new Node({op: (v) => (0 - v), varbs: [x], diffGetters: [(x) => (rhqD.const(-1))]});
  x.fathers.push(p);
  return p;
}

const sigmod = (x) => {
  const p = new Node({op: (v) => (1 / (1 + Math.exp(0 - v))), varbs: [x], diffGetters: [(x) => (mul(p, minus(rhqD.const(1), p)))]});
  x.fathers.push(p);
  return p;
};

const tanh = (x) => {
  const p = new Node({
    op: (v) => (Math.sinh(v) / Math.cosh(v)),
    varbs: [x],
    diffGetters: [(x) => (minus(rhq.const(1), square(p)))]
  });
  x.fathers.push(p);
  return p;
};

const square = (x) => {
  const p = new Node({op: (v) => (v * v), varbs: [x], diffGetters: [(x) => (mul(x, rhqD.const(2)))]});
  x.fathers.push(p);
  return p;
}

//二元函数
const pow = (x, y) => {
  const p = new Node({
    op: (v1, v2) => (Math.pow(v1, v2)),
    varbs: [x, y],
    diffGetters: [
      (x, y) => (mul(y, pow(x, minus(y, rhqD.const(1))))),
      (x, y) => (mul(ln(x), pow(x, y)))
    ]
  });
  x.fathers.push(p);
  y.fathers.push(p);
  return p;
};

const add = (x, y) => {
  const p = new Node({
    op: (v1, v2) => (v1 + v2),
    varbs: [x, y],
    diffGetters: [
      (x, y) => (rhqD.const(1)),
      (x, y) => (rhqD.const(1))
    ]
  });
  x.fathers.push(p);
  y.fathers.push(p);
  return p;
};

const minus = (x, y) => {
  const p = new Node({
    op: (v1, v2) => (v1 - v2),
    varbs: [x, y],
    diffGetters: [
      (x, y) => (rhqD.const(1)),
      (x, y) => (rhqD.const(-1))
    ]
  });
  x.fathers.push(p);
  y.fathers.push(p);
  return p;
};

const mul = (x, y) => {
  const p = new Node({
    op: (v1, v2) => (v1 * v2),
    varbs: [x, y],
    diffGetters: [
      (x, y) => (y),
      (x, y) => (x)
    ]
  });
  x.fathers.push(p);
  y.fathers.push(p);
  return p;
};

const div = (x, y) => {
  const p = new Node({
    op: (v1, v2) => (v1 / v2),
    varbs: [x, y],
    diffGetters: [
      (x, y) => (div(rhqD.const(1), y)),
      (x, y) => (neg(mul(x, pow(y, rhqD.const(-2)))))
    ]
  });
  x.fathers.push(p);
  y.fathers.push(p);
  return p;
};

const log = (x, y) => {
  const p = new Node({
    op: (v1, v2) => (Math.log(v2) / Math.log(v1)),
    varbs: [x, y],
    diffGetters: [
      (x, y) => (div(mul(ln(y), pow(ln(x), rhqD.const(-2))), x)),
      (x, y) => (div(rhqD.const(1), mul(ln(x), ln(y))))
    ]
  });
  x.fathers.push(p);
  y.fathers.push(p);
  return p;
};

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
};

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
