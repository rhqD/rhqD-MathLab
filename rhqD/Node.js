const _ = require('lodash');
class Node {
  static varb(name){
    const p = new Node({name, caculated: true, priority: Infinity});
    p.toExpression = () => (p.name);
    return p;
  };

  static constant(x){
    const p = new Node({
      op: () => (x),
      value: x,
      varbs: [],
      isConstant: true,
      caculated: true,
      priority: Infinity
    });
    p.toExpression = () => (p.value);
    return p;
  };

  // _isConstant = false;
  // _value = null;
  // varbs = [];
  // fathers = [];
  // op = null;
  // _diffs = null;
  // _caculated = false;
  // _diffGetters = null;
  // _name = '';
  constructor({op = null, opName = '', varbs = [], diffGetters = [], isConstant = false, name = '', caculated = false, value = null, priority = 0}){
    this.fathers = [];
    this.op = op;
    this.varbs = varbs;
    this._diffGetters = diffGetters;
    this._isConstant = isConstant;
    this._name = name;
    this._caculated = caculated;
    this._value = value;
    this.opName = opName;
    this.memo = [];
    this.priority = priority;
    this.varbs.forEach((p) => {
      p.fathers.push(this);
    });
  }

  get name(){
    if (this._isConstant){
      return `CONSTANT ${this._value}`;
    }
    if (_.isFunction(this._name)){
      return this._name();
    }
    return this._name;
  }

  get diffs(){
    if (!_.isArray(this._diffs)){
      this._diffs = this._diffGetters.map((getter) => (getter(...this.varbs)));
    }
    return this._diffs;
  };

  get value(){
    if (this._caculated){
      //节点值已计算过，直接返回
      return this._value;
    } else {
      //节点值仍未计算，开始计算
      if (this._isConstant){
        //如果收常数则直接返回_value
        return this._value;
      }
      const args = this.varbs.map((item) => {
        const result = item.value;
        if (!_.isNumber(result) || _.isNaN(result)){
          throw('cant caculate value, not all varbs ha value');
        }
        return result;
      });
      const value = this.op(...args);
      this._value = value;
      this._caculated = true;
      return value;
    }
  }

  set value(v){
    if (_.isEmpty(this.varbs)){
      //叶子结点，可以修改value
      this._value = v;
      this.fathers.forEach((item) => {
        item.spreadDirtyStatus();
      })
    } else {
      //非叶子节点，不允许修改
      throw('非叶子节点，不允许修改value');
    }
  }

  //修改叶子节点value后，自下而上传播脏状态
  spreadDirtyStatus(){
    //如果发现父节点已经被标记为未计算则停止传播，因为整套逻辑可以保证一定不会出现，父节点是已计算状态，但是子节点还是未计算状态
    if (this._caculated){
      this._caculated = false;
      this.fathers.forEach((item) => {
        item.spreadDirtyStatus();
      });
    }
  }

  //将所有对当前节点的依赖，替换为新节点
  replaceMeWith(node){
    //先将当前节点从所有的子节点的fathers中移除
    this.varbs.forEach((varb) => {
      varb.fathers = varb.fathers.filter((father) => (father !== this));
    });
    this.fathers.forEach((father) => {
      node.fathers.push(father);
      father.varbs = father.varbs.map((varb) => (varb === this ? node : varb));
    });
  }

  //判断当前节点是否依赖于给定节点
  dependsOn(varb) {
    return varb === this || this.varbs.some(item => item.dependsOn(varb))
  }

  find(rule) {
    const resultFromVarbs = flatten(this.varbs.map(varb => varb.find(rule)));
    if (rule(this)) {
      return [
          this,
          ...resultFromVarbs,
      ];
    }
    return resultFromVarbs;
  }

  //判断当前节点是否不依赖于给定节点
  independentFrom(varb) {
    return !this.dependsOn(varb);
  }

  deriv(varb){
    if (varb === this){
      //对自己求导
      return Node.constant(1);
    }
    const target = _.find(this.memo, (item) => (varb === item.varb));
    if (target){
      // console.error('unnesscary deriv !!!!!');
      return target.result;
    }
    let result = Node.constant(0);
    this.varbs.forEach((item, index) => {
      result = add(result, mul(this.diffs[index], item.deriv(varb)));
    });
    const optimizedResult = result.getOptimizedNode();
    this.memo.push({varb, result: optimizedResult});
    return optimizedResult
  }

  //优化节点（包括当前节点），主要针对1*x,0*x,0+x的情况
  getOptimizedNode(){
    const len = this.varbs.length;
    //先优化子节点，再优化当前节点
    for(let i = 0; i < len; i++){
      this.varbs[i].getOptimizedNode();
    }
    const consts = this.varbs.filter((varb) => (varb._isConstant));
    if (this.opName === 'piecewise'){
      //分段函数暂时不做优化
      return this;
    } else if (consts.length === this.varbs.length && consts.length !== 0){
      //全是常数的情况
      const varbValues = this.varbs.map((varb) => (varb.value));
      const value = this.op(...varbValues);
      const newNode = Node.constant(value);
      this.replaceMeWith(newNode);
      return newNode;
    } else if (consts.length == 1 && this.varbs.length === 2){
      //有一个常数的情况
      const constValue = consts[0].value;
      //不是常数的那个变量的索引
      const nonConstantIndex = _.findIndex(this.varbs, (varb) => (!varb._isConstant));
      let newNode = null;
      if (constValue === 1 && this.opName === 'mul'){
        //1*x的情况
        newNode = this.varbs[nonConstantIndex];
      }
      if (constValue === 0 && this.opName === 'add'){
        //0+x的情况
        newNode = this.varbs[nonConstantIndex];
      }
      if (constValue === 0 && this.opName === 'mul'){
        //0*x的情况
        newNode = consts[0];
      }
      if (newNode !== null){
        this.replaceMeWith(newNode);
        return newNode;
      }
    }
    return this;
  }

  //获取当前节点依赖的所有叶子节点
  get leafNodes(){
    if (_.isEmpty(this.varbs)) {
      return [this];
    }
    return _.flatten(this.varbs.map(v => v.leafNodes));
  }

  gradientDescent(up, learningRate = 0.001, threshold = 0.000001, maxCount = 1000){
    const leafNodes = this.leafNodes.filter(it => !it._isConstant);
    let points = leafNodes.map(() => (Math.random() * 10));
    const derivExpressions = leafNodes.map(n => (this.deriv(n)));
    let i = 0;
    let d = 0;
    let oldValue = null;
    do {
      i++;
      leafNodes.forEach((n, index) => {
        n.value = points[index];
      });
      if (_.isNumber(this.value) && _.isNumber(oldValue) && Math.abs(this.value - oldValue) <= threshold) {
        return this.value;
      }
      oldValue = this.value;
      const derivs = derivExpressions.map(n => n.value);
      const length = Math.sqrt(derivs.reduce((a, b) => (a + b * b), 0));
      const moves = derivs.map(dv => (up ? 1 : -1) * learningRate * dv / length);
      points = points.map((p, index) => (p + moves[index]));
    }
    while(i < maxCount);
    return null;
  }

  gradientDescentMax(...args){
    return this.gradientDescent(true, ...args);
  }

  gradientDescentMin(...args){
    return this.gradientDescent(false, ...args);
  }

}

const rangeReg = /^\s*(\(|\[)\s*(-inf|\d*.?\d*)\s*,\s*(inf|\d*.?\d*)\s*(\)|\])\s*$/;

class IntegralNode extends Node {
  constructor(...args) {
    super(...args);
    this.diffGetters = [
      (x, y) => (mul(y, x.deriv(y))),
      (x, y) => (y)
    ];
  }

  deriv(varb){
    if (varb === this){
      //对自己求导
      return Node.constant(1);
    }
    const target = _.find(this.memo, (item) => (varb === item.varb));
    if (target){
      // console.error('unnesscary deriv !!!!!');
      return target.result;
    }
    return mul(this.diffs[0], this.varbs[0].deriv(varb));
  }

  toExpression(){
    return `∫(${varbs[0].toExpression()})d(${varbs[1].toExpression()})`;
  }
}

class PiecedNode extends Node {

  constructor({pieces, rgVarbs}){
    super({varbs: pieces.map((i) => (i.exp))});
    this.rgVarbs = rgVarbs;
    this.opName = 'piecewise';
    rgVarbs.forEach((p) => {
      p.fathers.push(this);
    });
    this.pieces = _.map(pieces, (piece) => {
      const {range, exp} = piece;
      if (_.isString(range)){
        if (!rangeReg.test(range)){
          throw `illegal range of ${range}`;
        }
        const startClose = RegExp.$1 === '[';
        const start = RegExp.$2 === '-inf' ? -Infinity : parseFloat(RegExp.$2);
        const end = RegExp.$3 === 'inf' ? Infinity : parseFloat(RegExp.$3);
        const endClose = RegExp.$4 === ']';
        return {
          range: (x) => {
            return (x > start || startClose && x === start) && (x < end || endClose && x === end);
          },
          exp
        };
      }
      return piece;
    });
  }

  deriv(varb){
    if (varb === this){
      //对自己求导
      return Node.constant(1);
    }
    const target = _.find(this.memo, (item) => (varb === item.varb));
    if (target){
      // console.error('unnesscary deriv !!!!!');
      return target.result;
    }
    const pieces = this.pieces;
    return new PiecedNode({
      pieces: pieces.map(({range, exp}) => ({
        range,
        exp: exp.deriv(varb)
      })),
      rgVarbs: this.rgVarbs
    });
  }

  get value(){
    if (this._caculated){
      //节点值已计算过，直接返回
      return this._value;
    } else {
      const args = this.rgVarbs.map((item) => {
        const result = item.value;
        if (!_.isNumber(result) || _.isNaN(result)){
          throw('cant caculate value, not all varbs ha value');
        }
        return result;
      });
      const targetPiece = _.find(this.pieces, ({range, exp}) => (range(...args)));
      if (_.isEmpty(targetPiece)){
        throw('get value of undefined range of piecewise function');
      }
      const value = targetPiece.exp.value;
      this._value = value;
      this._caculated = true;
      return value;
    }
  }

  toExpression(){
    return '@';
  }
}


/****** functions *******/
//一元函数

const sin = (x) => {
  const p = new Node({
    op: Math.sin,
    opName: 'sin',
    varbs: [x],
    diffGetters: [(x) => (cos(x))],
    priority: Infinity
  });
  p.toExpression = () => (`sin(${p.varbs[0].toExpression()})`);
  return p;
};

const cos = (x) => {
  const p = new Node({
    op: Math.cos,
    opName: 'cos',
    varbs: [x],
    diffGetters: [(x) => (neg(sin(x)))],
    priority: Infinity
  });
  p.toExpression = () => (`cos(${p.varbs[0].toExpression()})`);
  return p;
};

const arccos = (x) => {
  const p = new Node({
    op: Math.acos,
    opName: 'acos',
    varbs: [x],
    diffGetters: [(x) => (neg(div(Node.constant(1), pow(minus(Node.constant(1), pow(x, Node.constant(2))), Node.constant(0.5)))))],
    priority: Infinity
  });
  p.toExpression = () => (`arccos(${p.varbs[0].toExpression()})`);
  return p;
};

const arcsin = (x) => {
  const p = new Node({
    op: Math.asin,
    opName: 'asin',
    varbs: [x],
    diffGetters: [(x) => (div(Node.constant(1), pow(minus(Node.constant(1), pow(x, Node.constant(2))), Node.constant(0.5))))],
    priority: Infinity
  });
  p.toExpression = () => (`arcsin(${p.varbs[0].toExpression()})`);
  return p;
};

const tan = (x) => {
  const p = new Node({
    op: Math.tan,
    opName: 'tan',
    varbs: [x],
    diffGetters: [(x) => (pow(cos(x), Node.constant(-2)))],
    priority: Infinity
  });
  p.toExpression = () => (`tan(${p.varbs[0].toExpression()})`);
  return p;
};

const ln = (x) => {
  const p = new Node({
    op: Math.log,
    opName: 'log',
    varbs: [x],
    diffGetters: [(x) => (div(Node.constant(1), x))],
    priority: Infinity
  });
  p.toExpression = () => (`ln(${p.varbs[0].toExpression()})`);
  return p;
}

const exp = (x) => {
  const p = new Node({
    op: Math.exp,
    opName: 'exp',
    varbs: [x],
    diffGetters: [(x) => (exp(x))],
    priority: Infinity
  });
  p.toExpression = () => (`exp(${p.varbs[0].toExpression()})`);
  return p;
}

const neg = (x) => {
  const p = new Node({
    op: (v) => (0 - v),
    opName: 'neg',
    varbs: [x],
    diffGetters: [(x) => (Node.constant(-1))],
    priority: 100
  });
  p.toExpression = () => (`-${p.varbs[0].priority <= p.priority ? '(' : ''}${p.varbs[0].toExpression()}${p.varbs[0].priority <= p.priority ? ')' : ''}`);
  return p;
}

const sigmod = (x) => {
  const p = new Node({
    op: (v) => (1 / (1 + Math.exp(0 - v))),
    opName: 'sigmod',
    varbs: [x],
    diffGetters: [(x) => (mul(p, minus(Node.constant(1), p)))],
    priority: Infinity
  });
  p.toExpression = () => (`sigmod(${p.varbs[0].toExpression()})`);
  return p;
};

const tanh = (x) => {
  const p = new Node({
    op: (v) => (Math.sinh(v) / Math.cosh(v)),
    opName: 'tanh',
    varbs: [x],
    diffGetters: [(x) => (minus(rhq.const(1), square(p)))],
    priority: Infinity
  });
  p.toExpression = () => (`tanh(${p.varbs[0].toExpression()})`);
  return p;
};

const square = (x) => {
  const p = new Node({
    op: (v) => (v * v),
    opName: 'square',
    varbs: [x],
    diffGetters: [(x) => (mul(x, Node.constant(2)))],
    priority: 10000
  });
  p.toExpression = () => (`${p.varbs[0].priority <= p.priority ? '(' : ''}${p.varbs[0].toExpression()}${p.varbs[0].priority <= p.priority ? ')' : ''}²`);
  return p;
}

const relu = (x) => {
  const p = new PiecedNode({
    pieces: [
      {
        range: '(-inf, 0]',
        exp: Node.constant(0)
      },
      {
        range: '(0, inf)',
        exp: x
      }
    ],
    rgVarbs: [x]
  });
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
    ],
    priority: 1000
  });
  p.toExpression = () => (`${p.varbs[0].priority <= p.priority ? '(' : ''}${p.varbs[0].toExpression()}${p.varbs[0].priority <= p.priority ? ')' :''}^${p.varbs[1].priority <= p.priority ? '(' : ''}${p.varbs[1].toExpression()}${p.varbs[1].priority <= p.priority ? ')' : ''}`);
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
    ],
    priority: 1
  });
  p.toExpression = () => (`${p.varbs[0].priority <= p.priority ? '(' : ''}${p.varbs[0].toExpression()}${p.varbs[0].priority <= p.priority ? ')' : ''} + ${p.varbs[1].priority <= p.priority ? '(' : ''}${p.varbs[1].toExpression()}${p.varbs[1].priority <= p.priority ? ')' : ''}`);
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
    ],
    priority: 1
  });
  p.toExpression = () => (`${p.varbs[0].priority <= p.priority ? '(' : ''}${p.varbs[0].toExpression()}${p.varbs[0].priority <= p.priority ? ')' : ''} - ${p.varbs[0].priority <= p.priority ? '(' : ''}${p.varbs[1].toExpression()}${p.varbs[1].priority <= p.priority ? ')' : ''}`);
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
    ],
    priority: 10
  });
  p.toExpression = () => (`${p.varbs[0].priority <= p.priority ? '(' : ''}${p.varbs[0].toExpression()}${p.varbs[0].priority <= p.priority ? ')' : ''} * ${p.varbs[1].priority <= p.priority ? '(' : ''}${p.varbs[1].toExpression()}${p.varbs[1].priority <= p.priority ? ')' : ''}`);
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
    ],
    priority: 10
  });
  p.toExpression = () => (`${p.varbs[0].priority <= p.priority ? '(' : ''}${p.varbs[0].toExpression()}${p.varbs[0].priority <= p.priority ? ')' : ''} / ${p.varbs[0].priority <= p.priority ? '(' : ''}${p.varbs[1].toExpression()}${p.varbs[1].priority <= p.priority ? ')' : ''}`);
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
    ],
    priority: Infinity
  });
  p.toExpression = () => (`log(${p.varbs[0].toExpression()}, ${p.varbs[1].toExpression()})`);
  return p;
};

const integral = (y, x) => {
  const p = new IntegralNode({
    opName: 'integral',
    varbs: [y, x],
  });
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

Node.functions = {
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
  relu,
  pow,
  add,
  minus,
  mul,
  div,
  log,
  sum,
  integral,
}

module.exports = Node;
