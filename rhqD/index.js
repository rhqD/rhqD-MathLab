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
    return Node.constant(1);
  }
  let result = Node.constant(0);
  tensor.varbs.forEach((subTensor, index) => {
    result = add(result, mul(tensor.diffs[index], rhqD.getDiffTensor(subTensor, arg, table)));
  });
  if (tensor.guid !== undefined && arg.guid !== undefined){
    _.set(table, [tensor.guid, arg.guid], result);
  }
  return result.getOptimizedNode();
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



/****** functions *******/
//一元函数

const sin = (x) => {
  const p = new Node({
    op: Math.sin,
    opName: 'sin',
    varbs: [x],
    diffGetters: [(x) => (cos(x))]
  });
  p.toExpression = () => (`sin(${p.varbs[0].toExpression()})`);
  x.fathers.push(p);
  return p;
};

const cos = (x) => {
  const p = new Node({
    op: Math.cos,
    opName: 'cos',
    varbs: [x],
    diffGetters: [(x) => (neg(sin(x)))]
  });
  p.toExpression = () => (`cos(${p.varbs[0].toExpression()})`);
  x.fathers.push(p);
  return p;
};

const arccos = (x) => {
  const p = new Node({
    op: Math.acos,
    opName: 'acos',
    varbs: [x],
    diffGetters: [(x) => (neg(div(Node.constant(1), pow(minus(Node.constant(1), pow(x, Node.constant(2))), Node.constant(0.5)))))]
  });
  p.toExpression = () => (`arccos(${p.varbs[0].toExpression()})`);
  x.fathers.push(p);
  return p;
};

const arcsin = (x) => {
  const p = new Node({
    op: Math.asin,
    opName: 'asin',
    varbs: [x],
    diffGetters: [(x) => (div(Node.constant(1), pow(minus(Node.constant(1), pow(x, Node.constant(2))), Node.constant(0.5))))]
  });
  p.toExpression = () => (`arcsin(${p.varbs[0].toExpression()})`);
  x.fathers.push(p);
  return p;
};

const tan = (x) => {
  const p = new Node({
    op: Math.tan,
    opName: 'tan',
    varbs: [x],
    diffGetters: [(x) => (pow(cos(x), Node.constant(-2)))]
  });
  p.toExpression = () => (`tan(${p.varbs[0].toExpression()})`);
  x.fathers.push(p);
  return p;
};

const ln = (x) => {
  const p = new Node({
    op: Math.log,
    opName: 'log',
    varbs: [x],
    diffGetters: [(x) => (div(Node.constant(1), x))]
  });
  p.toExpression = () => (`ln(${p.varbs[0].toExpression()})`);
  x.fathers.push(p);
  return p;
}

const exp = (x) => {
  const p = new Node({
    op: Math.exp,
    opName: 'exp',
    varbs: [x],
    diffGetters: [(x) => (exp(x))]
  });
  p.toExpression = () => (`exp(${p.varbs[0].toExpression()})`);
  x.fathers.push(p);
  return p;
}

const neg = (x) => {
  const p = new Node({
    op: (v) => (0 - v),
    opName: 'neg',
    varbs: [x],
    diffGetters: [(x) => (Node.constant(-1))]
  });
  p.toExpression = () => (`-(${p.varbs[0].toExpression()})`);
  x.fathers.push(p);
  return p;
}

const sigmod = (x) => {
  const p = new Node({
    op: (v) => (1 / (1 + Math.exp(0 - v))),
    opName: 'sigmod',
    varbs: [x],
    diffGetters: [(x) => (mul(p, minus(Node.constant(1), p)))]
  });
  p.toExpression = () => (`sigmod(${p.varbs[0].toExpression()})`);
  x.fathers.push(p);
  return p;
};

const tanh = (x) => {
  const p = new Node({
    op: (v) => (Math.sinh(v) / Math.cosh(v)),
    opName: 'tanh',
    varbs: [x],
    diffGetters: [(x) => (minus(rhq.const(1), square(p)))]
  });
  p.toExpression = () => (`tanh(${p.varbs[0].toExpression()})`);
  x.fathers.push(p);
  return p;
};

const square = (x) => {
  const p = new Node({
    op: (v) => (v * v),
    opName: 'square',
    varbs: [x],
    diffGetters: [(x) => (mul(x, Node.constant(2)))]
  });
  p.toExpression = () => (`(${p.varbs[0].toExpression()})^2`);
  x.fathers.push(p);
  return p;
}

//二元函数
const pow = (x, y) => {
  const p = new Node({
    op: (v1, v2) => (Math.pow(v1, v2)),
    opName: 'pow',
    varbs: [x, y],
    diffGetters: [
      (x, y) => (mul(y, pow(x, minus(y, Node.constant(1))))),
      (x, y) => (mul(ln(x), pow(x, y)))
    ]
  });
  p.toExpression = () => (`(${p.varbs[0].toExpression()})^(${p.varbs[1].toExpression()})`);
  x.fathers.push(p);
  y.fathers.push(p);
  return p;
};

const add = (x, y) => {
  const p = new Node({
    op: (v1, v2) => (v1 + v2),
    opName: 'add',
    varbs: [x, y],
    diffGetters: [
      (x, y) => (Node.constant(1)),
      (x, y) => (Node.constant(1))
    ]
  });
  p.toExpression = () => (`(${p.varbs[0].toExpression()}) + (${p.varbs[1].toExpression()})`);
  x.fathers.push(p);
  y.fathers.push(p);
  return p;
};

const minus = (x, y) => {
  const p = new Node({
    op: (v1, v2) => (v1 - v2),
    opName: 'minus',
    varbs: [x, y],
    diffGetters: [
      (x, y) => (Node.constant(1)),
      (x, y) => (Node.constant(-1))
    ]
  });
  p.toExpression = () => (`(${p.varbs[0].toExpression()}) - (${p.varbs[1].toExpression()})`);
  x.fathers.push(p);
  y.fathers.push(p);
  return p;
};

const mul = (x, y) => {
  const p = new Node({
    op: (v1, v2) => (v1 * v2),
    opName: 'mul',
    varbs: [x, y],
    diffGetters: [
      (x, y) => (y),
      (x, y) => (x)
    ]
  });
  p.toExpression = () => (`(${p.varbs[0].toExpression()}) * (${p.varbs[1].toExpression()})`);
  x.fathers.push(p);
  y.fathers.push(p);
  return p;
};

const div = (x, y) => {
  const p = new Node({
    op: (v1, v2) => (v1 / v2),
    opName: 'div',
    varbs: [x, y],
    diffGetters: [
      (x, y) => (div(Node.constant(1), y)),
      (x, y) => (neg(mul(x, pow(y, Node.constant(-2)))))
    ]
  });
  p.toExpression = () => (`(${p.varbs[0].toExpression()}) / (${p.varbs[1].toExpression()})`);
  x.fathers.push(p);
  y.fathers.push(p);
  return p;
};

const log = (x, y) => {
  const p = new Node({
    op: (v1, v2) => (Math.log(v2) / Math.log(v1)),
    opName: 'log',
    varbs: [x, y],
    diffGetters: [
      (x, y) => (div(mul(ln(y), pow(ln(x), Node.constant(-2))), x)),
      (x, y) => (div(Node.constant(1), mul(ln(x), ln(y))))
    ]
  });
  p.toExpression = () => (`log(${p.varbs[0].toExpression()}, ${p.varbs[1].toExpression()})`);
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
