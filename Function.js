//一元函数
const sin = (x) => ({
  op: Math.sin,
  varbs: [x]
});

const cos = (x) => ({
  op: Math.cos,
  varbs: [x]
});

const arccos = (x) => ({
  op: Math.acos,
  varbs: [x]
});

const arcsin = (x) => ({
  op: Math.asin,
  varbs: [x]
});

const tan = (x) => ({
  op: Math.tan,
  varbs: [x]
});

const ln = (x) => ({
  op: Math.log,
  varbs: [x]
});

const exp = (x) => ({
  op: Math.exp,
  varbs: [x]
});

//二元函数
const pow = (x, y) => ({
  op: (x, y) => (Math.pow(x, y)),
  varbs: [x, y]
});

const add = (x, y) => ({
  op: (x, y) => (x + y),
  varbs: [x, y]
});

const minus = (x, y) => ({
  op: (x, y) => (x - y),
  varbs: [x, y]
});

const mul = (x, y) => ({
  op: (x, y) => (x * y),
  varbs: [x, y]
});

const div = (x, y) => ({
  op: (x, y) => (x / y),
  varbs: [x, y]
});

const log = (x, y) => ({
  op: (x, y) => (Math.log(y) / Math.log(x)),
  varbs: [x, y]
});
