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
      this._diffs = [neg(div(rhq.const(1), pow(minus(rhq.const(1), pow(x, rhq.const(2))), rhq.const(0.5))))];
    }
    return this._diffs;
  },
  varbs: [x]
});

const arcsin = (x) => ({
  op: Math.asin,
  get diffs(){
    if (!_.isArray(this._diffs)){
      this._diffs = [div(rhq.const(1), pow(minus(rhq.const(1), pow(x, rhq.const(2))), rhq.const(0.5)))];
    }
    return this._diffs;
  },
  varbs: [x]
});

const tan = (x) => ({
  op: Math.tan,
  get diffs(){
    if (!_.isArray(this._diffs)){
      this._diffs = [pow(cos(x), rhq.const(-2))];
    }
    return this._diffs;
  },
  varbs: [x]
});

const ln = (x) => ({
  op: Math.log,
  get diffs(){
    if (!_.isArray(this._diffs)){
      this._diffs = [div(rhq.const(1), x)];
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
      this._diffs = [rhq.const(-1)];
    }
    return this._diffs;
  },
  varbs: [x]
});

const sigmod = (x) => ({
  op: (v) => (1 / (1 + Math.exp(0 - v))),
  get diffs(){
    if (!_.isArray(this._diffs)){
      this._diffs = [mul(sigmod(x), minus(rhq.const(1), sigmod(x)))];
    }
    return this._diffs;
  },
  varbs: [x]
});

const square = (x) => ({
  op: (v) => (v * v),
  get diffs(){
    if (!_.isArray(this._diffs)){
      this._diffs = [mul(x, rhq.const(2))];
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
      this._diffs = [mul(y, pow(x, minus(y, rhq.const(1)))), mul(ln(x), pow(x, y))];
    }
    return this._diffs;
  },
  varbs: [x, y]
});

const add = (x, y) => ({
  op: (v1, v2) => (v1 + v2),
  get diffs(){
    if (!_.isArray(this._diffs)){
      this._diffs = [rhq.const(1), rhq.const(1)];
    }
    return this._diffs;
  },
  varbs: [x, y],
});

const minus = (x, y) => ({
  op: (v1, v2) => (v1 - v2),
  get diffs(){
    if (!_.isArray(this._diffs)){
      this._diffs = [rhq.const(1), rhq.const(-1)];
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
      this._diffs = [div(rhq.const(1), y), neg(mul(x, pow(y, rhq.const(-2))))];
    }
    return this._diffs;
  },
  varbs: [x, y]
});

const log = (x, y) => ({
  op: (v1, v2) => (Math.log(v2) / Math.log(v1)),
  get diffs(){
    if (!_.isArray(this._diffs)){
      this._diffs = [div(mul(ln(y), pow(ln(x), rhq.const(-2))), x), div(rhq.const(1), mul(ln(x), ln(y)))];
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
