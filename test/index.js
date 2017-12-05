const Node = require('../rhqD/Node');
require('colors');
const {functions} = Node;
const {sin, cos, arccos, arcsin, tan, ln, exp, neg, sigmod, square, pow, add, minus, mul, div, log, sum} = functions;
const _ = require('lodash');
const test = (describe, testBody) => {
  console.log(describe);
  const log = (message) => {
    console.log(`****${message}`);
  };
  const error = (message) => {
    console.error(`****${message}`.red);
  };
  const assert = (a, b, message = '') => {
    if (Math.abs(a - b) < 0.00000001){
      if (message.length > 0){
        log(message);
      }
    } else {
      error(`${message} ==> expect ${a} to equal ${b}`);
    }
  };
  testBody(assert);
  console.log();
  console.log();
  console.log();
}

//一元函数测试
test('test y = x', (assert) => {
  const x = Node.varb('x');

  x.value = 1;
  assert(x.value, 1);
  x.value = 2;
  assert(x.value, 2);
  x.value = 4;
  assert(x.value, 4);
  const dt = x.deriv(x);
  dt.value
  assert(dt.value, 1);
  x.value = 2;
  assert(dt.value, 1);
});

test('test y = 2 * x', (assert) => {
  const const2 = Node.constant(2);
  const x = Node.varb('x');
  const a2x = mul(x, const2);
  const b2x = add(x, x);
  const c2x = mul(const2, x);

  const df1 = a2x.deriv(x);
  const df2 = b2x.deriv(x);
  const df3 = c2x.deriv(x);
  x.value = 1;
  assert(a2x.value, 2, '1 * 2 = 2');
  assert(b2x.value, 2, '1 + 1 = 2');
  assert(c2x.value, 2, '2 * 1 = 2');
  x.value = 2;
  assert(a2x.value, 4, '2 * 2 = 4');
  assert(b2x.value, 4, '2 + 2 = 4');
  assert(c2x.value, 4, '2 * 2 = 4');
  x.value = 7;
  assert(a2x.value, 14, '7 * 2 = 14');
  assert(b2x.value, 14, '7 + 7 = 14');
  assert(c2x.value, 14, '2 * 7 = 14');
  x.value = 2;
  assert(df1.value, 2);
  assert(df2.value, 2);
  assert(df3.value, 2);
  x.value = 3;
  assert(df1.value, 2);
  assert(df2.value, 2);
  assert(df3.value, 2);
  x.value = 5;
  assert(df1.value, 2);
  assert(df2.value, 2);
  assert(df3.value, 2);
});

test('test y = 2 * x + 1', (assert) => {
  const const1 = Node.constant(1);
  const const2 = Node.constant(2);
  const x = Node.varb('x');
  const a2x = mul(x, const2);

  const a2xPlus1 = add(a2x, const1);
  const dt = a2xPlus1.deriv(x);
  x.value = 2;
  assert(a2xPlus1.value, 5);
  x.value = 7;
  assert(a2xPlus1.value, 15);
  x.value = 9;
  assert(a2xPlus1.value, 19);
  x.value = 1;
  assert(dt.value, 2);
  x.value = 3;
  assert(dt.value, 2);
  x.value = 17;
  assert(dt.value, 2);
});

test('test y = sin(x)', (assert) => {
  const x = Node.varb('x');
  const sinx = sin(x);

  const dt = sinx.deriv(x);
  x.value = 0;
  assert(sinx.value, 0, 'sin(0) = 0');
  x.value = Math.PI;
  assert(sinx.value, Math.sin(Math.PI), 'sin(PI) = 0');
  x.value = Math.PI / 6;
  assert(sinx.value, Math.sin(Math.PI / 6), 'sin(PI / 6) = 0.5');
  x.value = 0;
  assert(dt.value, 1, 'sin\'(0) = cos(0) = 1');
  x.value = Math.PI / 3;
  assert(dt.value, Math.cos(Math.PI / 3), 'sin\'(PI / 3) = cos(PI / 3) = 0.5');
});

test('test y = sin(2x + 1)', (assert) => {
  const const1 = Node.constant(1);
  const const2 = Node.constant(2);
  const x = Node.varb('x');
  const a2x = mul(x, const2);

  const vt = sin(add(a2x, const1));
  const dt = vt.deriv(x);
  x.value = 1;
  assert(vt.value, Math.sin(3));
  x.value = 0;
  assert(vt.value, Math.sin(1));
  x.value = 0;
  assert(dt.value, 2 * Math.cos(1));
  x.value = 1;
  assert(dt.value, 2 * Math.cos(3));
});

test('test y = arcsin(x)', (assert) => {
  const x = Node.varb('x');

  const vt = arcsin(x);
  const dt = vt.deriv(x);
  x.value = 1;
  assert(vt.value, Math.PI / 2);
  x.value = 0.5;
  assert(vt.value, Math.PI / 6);
  x.value = 0;
  assert(dt.value, 1);
  x.value = 0.6;
  assert(dt.value, 1.25);
});

test('test y = cos(x)', (assert) => {
  const x = Node.varb('x');
  const cosx = cos(x);
  const dt = cosx.deriv(x);
  x.value = 0;
  assert(cosx.value, 1, 'cos(0) = 1');
  x.value = 1;
  assert(cosx.value, Math.cos(1));
  x.value = 0;
  assert(dt.value, 0, 'cos\'(0) = 0');
  x.value = 1;
  assert(dt.value, 0 - Math.sin(1));
});

test('test y = arccos(x)', (assert) => {
  const x = Node.varb('x');

  const vt = arccos(x);
  const dt = vt.deriv(x);
  x.value = 1;
  assert(vt.value, Math.acos(1));
  x.value = 0.8;
  assert(vt.value, Math.acos(0.8));
  x.value = 0;
  assert(dt.value, -1);
  x.value = 0.6;
  assert(dt.value, -1.25);
});

test('test y = tan(x)', (assert) => {
  const x = Node.varb('x');
  const vt = tan(x);
  const dt = vt.deriv(x);
  x.value = 0;
  assert(vt.value, 0);
  x.value = Math.PI / 3;
  assert(vt.value, Math.tan(Math.PI / 3));
  x.value = 0;
  assert(dt.value, 1);
  x.value = Math.PI / 3;
  assert(dt.value, 4);
});

test('test y = exp(x)', (assert) => {
  const x = Node.varb('x');
  const vt = exp(x);
  const dt = vt.deriv(x);
  x.value = 0;
  assert(vt.value, 1);
  x.value = 2;
  assert(vt.value, Math.E * Math.E);
  x.value = 0;
  assert(dt.value, 1);
  x.value = 2;
  assert(dt.value, Math.E * Math.E);
});

test('test y = ln(x)', (assert) => {
  const x = Node.varb('x');
  const vt = ln(x);
  const dt = vt.deriv(x);
  x.value = 1;
  assert(vt.value, 0);
  x.value = Math.E;
  assert(vt.value, 1);
  x.value = 2;
  assert(dt.value, 0.5);
  x.value = 3;
  assert(dt.value, 1 / 3);
});

test('test y = neg(x)', (assert) => {
  const x = Node.varb('x');
  const vt = neg(x);
  const dt = vt.deriv(x);
  x.value = 0;
  assert(vt.value, 0);
  x.value = 1;
  assert(vt.value, -1);
  x.value = 1;
  assert(dt.value, -1);
  x.value = 3;
  assert(dt.value, -1);
});

test('test y = sigmod(x)', (assert) => {
  const x = Node.varb('x');
  const vt = sigmod(x);
  const dt = vt.deriv(x);
  x.value = 0;
  assert(vt.value, 0.5, '1');
  x.value = 1;
  assert(vt.value, 1 / (1 + 1 / Math.E), '2');
  x.value = 1;
  assert(dt.value, vt.value * (1 - vt.value), '3');
  x.value = 2;
  assert(dt.value, vt.value * (1 - vt.value), '4');
});

test('test y = square(x)', (assert) => {
  const x = Node.varb('x');
  const vt = square(x);
  const dt = vt.deriv(x);
  x.value = 1;
  assert(vt.value, 1);
  x.value = 2;
  assert(vt.value, 4);
  x.value = 3;
  assert(vt.value, 9);
  x.value = 1;
  assert(dt.value, 2);
  x.value = 2;
  assert(dt.value, 4);
  x.value = 3;
  assert(dt.value, 6);
});

// //二元函数测试
test('test y = pow(x, y)', (assert) => {
  const x = Node.varb('x');
  const y = Node.varb('y');
  const vt = pow(x, y);
  const dtx = vt.deriv(x);
  const dty = vt.deriv(y);
  x.value = 1;
  y.value = 2;
  assert(vt.value, 1, '1^2 = 1');
  x.value = 3;
  y.value = 3;
  assert(vt.value, 27, '3^3 = 27');
  x.value = 2;
  y.value = 4;
  assert(vt.value, 16, '2^4 = 16');
  //y*(x^(y-1))
  x.value = 1;
  y.value = 0;
  assert(dtx.value, 0, '0*(1^-1) = 0');
  x.value = 2;
  y.value = 3;
  assert(dtx.value, 12, '3*(2^2) = 12');
  x.value = 3;
  y.value = 3;
  assert(dtx.value, 27, '3*(3^2) = 27');
  //ln(x)*(x^y)
  x.value = 2;
  y.value = 2;
  assert(dty.value, Math.log(2) * 4);
  x.value = 3;
  y.value = 5;
  assert(dty.value, Math.log(3) * 243);
  x.value = 1;
  y.value = 3;
  assert(dty.value, 0);
});

test('test y = pow(x, 2)', (assert) => {
  const x = Node.varb('x');
  const const2 = Node.constant(2);
  const vt = pow(x, const2);
  const dtx = vt.deriv(x);
  x.value = 1;
  assert(vt.value, 1, '1^2 = 1');
  x.value = 2;
  assert(vt.value, 4, '2^2 = 4');
  x.value = 3;
  assert(vt.value, 9, '3^2 = 9');
  x.value = 3;
  assert(dtx.value, 6);
  x.value = 2;
  assert(dtx.value, 4);
  x.value = 5;
  assert(dtx.value, 10);
});

test('test y = pow(2, x)', (assert) => {
  const x = Node.varb('x');
  const const2 = Node.constant(2);
  const vt = pow(const2, x);
  const dtx = vt.deriv(x);
  x.value = 1;
  assert(vt.value, 2, '2^1 = 2');
  x.value = 3;
  assert(vt.value, 8, '2^3 = 8');
  x.value = 4;
  assert(vt.value, 16, '2^4 = 16');
  // ln(2)*(2^x)
  const ln2 = Math.log(2);
  x.value = 3;
  assert(dtx.value, ln2 * 8);
  x.value = 2;
  assert(dtx.value, ln2 * 4);
  x.value = 7;
  assert(dtx.value, ln2 * Math.pow(2, 7));
});

test('test y = x + y', (assert) => {
  const x = Node.varb('x');
  const y = Node.varb('y');
  const vt = add(x, y);
  const dtx = vt.deriv(x);
  const dty = vt.deriv(y);
  x.value = 1;
  y.value = 2;
  assert(vt.value, 3);
  x.value = 2;
  y.value = 4;
  assert(vt.value, 6);
  x.value = 3;
  y.value = 7;
  assert(vt.value, 10);
  x.value = 1;
  y.value = 6;
  assert(dtx.value, 1);
  x.value = 2;
  y.value = 4;
  assert(dtx.value, 1);
  x.value = 3;
  y.value = 5;
  assert(dtx.value, 1);
  x.value = 4;
  y.value = 7;
  assert(dty.value, 1);
  x.value = 5;
  y.value = 8;
  assert(dty.value, 1);
  x.value = 6;
  y.value = 9;
  assert(dty.value, 1);
});

test('test y = 2x + 3y', (assert) => {
  const x = Node.varb('x');
  const y = Node.varb('y');
  const const2 = Node.constant(2);
  const const3 = Node.constant(3);
  const vt = add(mul(const2, x), mul(const3, y));
  const dtx = vt.deriv(x);
  const dty = vt.deriv(y);
  // console.error(dty.toExpression());
  // console.error(dtyY.toExpression());
  x.value = 1;
  y.value = 2;
  assert(vt.value, 8);
  x.value = 2;
  y.value = 3;
  assert(vt.value, 13);
  x.value = 0;
  y.value = 4;
  assert(vt.value, 12);
  x.value = 1;
  y.value = 3;
  assert(dtx.value, 2);
  x.value = 3;
  y.value = 7;
  assert(dtx.value, 2);
  x.value = 5;
  y.value = 7;
  assert(dtx.value, 2);
  x.value = 3;
  y.value = 4;
  assert(dty.value, 3);
  x.value = 6;
  y.value = 7;
  assert(dty.value, 3);
  x.value = 5;
  y.value = 9;
  assert(dty.value, 3);
});

// test('test y = x - y', (assert) => {
//   const vt = ();
//   const vf = rhqD.getValueFunc(vt, x, y);
//   const dfx = rhqD.getValueFunc(rhqD.getDiffTensor(vt, x), x, y);
//   const dfy = rhqD.getValueFunc(rhqD.getDiffTensor(vt, y), x, y);
//   assert(vf(), );
//   assert(vf(), );
//   assert(vf(), );
//   assert(dfx(), );
//   assert(dfx(), );
//   assert(dfx(), );
//   assert(dfy(), );
//   assert(dfy(), );
//   assert(dfy(), );
// });
//
// test('test y = 2x - 3y', (assert) => {
//   const vt = ();
//   const vf = rhqD.getValueFunc(vt, x, y);
//   const dfx = rhqD.getValueFunc(rhqD.getDiffTensor(vt, x), x, y);
//   const dfy = rhqD.getValueFunc(rhqD.getDiffTensor(vt, y), x, y);
//   assert(vf(), );
//   assert(vf(), );
//   assert(vf(), );
//   assert(dfx(), );
//   assert(dfx(), );
//   assert(dfx(), );
//   assert(dfy(), );
//   assert(dfy(), );
//   assert(dfy(), );
// });
//
// test('test y = x - 2', (assert) => {
//   const vt = ();
//   const vf = rhqD.getValueFunc(vt, x, y);
//   const dfx = rhqD.getValueFunc(rhqD.getDiffTensor(vt, x), x, y);
//   const dfy = rhqD.getValueFunc(rhqD.getDiffTensor(vt, y), x, y);
//   assert(vf(), );
//   assert(vf(), );
//   assert(vf(), );
//   assert(dfx(), );
//   assert(dfx(), );
//   assert(dfx(), );
//   assert(dfy(), );
//   assert(dfy(), );
//   assert(dfy(), );
// });
//
// test('test y = x * y', (assert) => {
//   const vt = ();
//   const vf = rhqD.getValueFunc(vt, x, y);
//   const dfx = rhqD.getValueFunc(rhqD.getDiffTensor(vt, x), x, y);
//   const dfy = rhqD.getValueFunc(rhqD.getDiffTensor(vt, y), x, y);
//   assert(vf(), );
//   assert(vf(), );
//   assert(vf(), );
//   assert(dfx(), );
//   assert(dfx(), );
//   assert(dfx(), );
//   assert(dfy(), );
//   assert(dfy(), );
//   assert(dfy(), );
// });
//
// test('test y = 2x * y', (assert) => {
//   const vt = ();
//   const vf = rhqD.getValueFunc(vt, x, y);
//   const dfx = rhqD.getValueFunc(rhqD.getDiffTensor(vt, x), x, y);
//   const dfy = rhqD.getValueFunc(rhqD.getDiffTensor(vt, y), x, y);
//   assert(vf(), );
//   assert(vf(), );
//   assert(vf(), );
//   assert(dfx(), );
//   assert(dfx(), );
//   assert(dfx(), );
//   assert(dfy(), );
//   assert(dfy(), );
//   assert(dfy(), );
// });
//
// test('test y = x * 2', (assert) => {
//   const vt = ();
//   const vf = rhqD.getValueFunc(vt, x, y);
//   const dfx = rhqD.getValueFunc(rhqD.getDiffTensor(vt, x), x, y);
//   const dfy = rhqD.getValueFunc(rhqD.getDiffTensor(vt, y), x, y);
//   assert(vf(), );
//   assert(vf(), );
//   assert(vf(), );
//   assert(dfx(), );
//   assert(dfx(), );
//   assert(dfx(), );
//   assert(dfy(), );
//   assert(dfy(), );
//   assert(dfy(), );
// });
//
// test('test y = x * 0', (assert) => {
//   const vt = ();
//   const vf = rhqD.getValueFunc(vt, x, y);
//   const dfx = rhqD.getValueFunc(rhqD.getDiffTensor(vt, x), x, y);
//   const dfy = rhqD.getValueFunc(rhqD.getDiffTensor(vt, y), x, y);
//   assert(vf(), );
//   assert(vf(), );
//   assert(vf(), );
//   assert(dfx(), );
//   assert(dfx(), );
//   assert(dfx(), );
//   assert(dfy(), );
//   assert(dfy(), );
//   assert(dfy(), );
// });
//
// test('test y = x / y', (assert) => {
//   const vt = ();
//   const vf = rhqD.getValueFunc(vt, x, y);
//   const dfx = rhqD.getValueFunc(rhqD.getDiffTensor(vt, x), x, y);
//   const dfy = rhqD.getValueFunc(rhqD.getDiffTensor(vt, y), x, y);
//   assert(vf(), );
//   assert(vf(), );
//   assert(vf(), );
//   assert(dfx(), );
//   assert(dfx(), );
//   assert(dfx(), );
//   assert(dfy(), );
//   assert(dfy(), );
//   assert(dfy(), );
// });
//
// test('test y = 2x / y', (assert) => {
//   const vt = ();
//   const vf = rhqD.getValueFunc(vt, x, y);
//   const dfx = rhqD.getValueFunc(rhqD.getDiffTensor(vt, x), x, y);
//   const dfy = rhqD.getValueFunc(rhqD.getDiffTensor(vt, y), x, y);
//   assert(vf(), );
//   assert(vf(), );
//   assert(vf(), );
//   assert(dfx(), );
//   assert(dfx(), );
//   assert(dfx(), );
//   assert(dfy(), );
//   assert(dfy(), );
//   assert(dfy(), );
// });
//
// test('test y = x / 2', (assert) => {
//   const vt = ();
//   const vf = rhqD.getValueFunc(vt, x, y);
//   const dfx = rhqD.getValueFunc(rhqD.getDiffTensor(vt, x), x, y);
//   const dfy = rhqD.getValueFunc(rhqD.getDiffTensor(vt, y), x, y);
//   assert(vf(), );
//   assert(vf(), );
//   assert(vf(), );
//   assert(dfx(), );
//   assert(dfx(), );
//   assert(dfx(), );
//   assert(dfy(), );
//   assert(dfy(), );
//   assert(dfy(), );
// });
//
// test('test y = log(x, y)', (assert) => {
//   const vt = ();
//   const vf = rhqD.getValueFunc(vt, x, y);
//   const dfx = rhqD.getValueFunc(rhqD.getDiffTensor(vt, x), x, y);
//   const dfy = rhqD.getValueFunc(rhqD.getDiffTensor(vt, y), x, y);
//   assert(vf(), );
//   assert(vf(), );
//   assert(vf(), );
//   assert(dfx(), );
//   assert(dfx(), );
//   assert(dfx(), );
//   assert(dfy(), );
//   assert(dfy(), );
//   assert(dfy(), );
// });
//
// test('test y = log(2x, y)', (assert) => {
//   const vt = ();
//   const vf = rhqD.getValueFunc(vt, x, y);
//   const dfx = rhqD.getValueFunc(rhqD.getDiffTensor(vt, x), x, y);
//   const dfy = rhqD.getValueFunc(rhqD.getDiffTensor(vt, y), x, y);
//   assert(vf(), );
//   assert(vf(), );
//   assert(vf(), );
//   assert(dfx(), );
//   assert(dfx(), );
//   assert(dfx(), );
//   assert(dfy(), );
//   assert(dfy(), );
//   assert(dfy(), );
// });
//
// test('test y = log(x, 2y)', (assert) => {
//   const vt = ();
//   const vf = rhqD.getValueFunc(vt, x, y);
//   const dfx = rhqD.getValueFunc(rhqD.getDiffTensor(vt, x), x, y);
//   const dfy = rhqD.getValueFunc(rhqD.getDiffTensor(vt, y), x, y);
//   assert(vf(), );
//   assert(vf(), );
//   assert(vf(), );
//   assert(dfx(), );
//   assert(dfx(), );
//   assert(dfx(), );
//   assert(dfy(), );
//   assert(dfy(), );
//   assert(dfy(), );
// });
//
// test('test y = log(2, x)', (assert) => {
//   const vt = ();
//   const vf = rhqD.getValueFunc(vt, x, y);
//   const dfx = rhqD.getValueFunc(rhqD.getDiffTensor(vt, x), x, y);
//   const dfy = rhqD.getValueFunc(rhqD.getDiffTensor(vt, y), x, y);
//   assert(vf(), );
//   assert(vf(), );
//   assert(vf(), );
//   assert(dfx(), );
//   assert(dfx(), );
//   assert(dfx(), );
//   assert(dfy(), );
//   assert(dfy(), );
//   assert(dfy(), );
// });
//
// test('test y = log(x, 2)', (assert) => {
//   const vt = ();
//   const vf = rhqD.getValueFunc(vt, x, y);
//   const dfx = rhqD.getValueFunc(rhqD.getDiffTensor(vt, x), x, y);
//   const dfy = rhqD.getValueFunc(rhqD.getDiffTensor(vt, y), x, y);
//   assert(vf(), );
//   assert(vf(), );
//   assert(vf(), );
//   assert(dfx(), );
//   assert(dfx(), );
//   assert(dfx(), );
//   assert(dfy(), );
//   assert(dfy(), );
//   assert(dfy(), );
// });

//复合函数测试
test('y = sinx, z = y ^ 2, w = 2 * z, v = w + 3', (assert) => {
  const x = Node.varb('x');
  const const2 = Node.constant(2);
  const const3 = Node.constant(3);
  const y = sin(x);
  const z = square(y);
  const w = mul(const2, z);
  const v = add(w, const3);
  const t = add(x, z);

  x.value = 0;
  assert(y.value, 0);
  assert(z.value, 0);
  assert(w.value, 0);
  assert(v.value, 3);
  assert(t.value, 0);
  x.value = Math.PI / 6;
  assert(y.value, 0.5);
  assert(z.value, 0.25);
  assert(w.value, 0.5);
  assert(v.value, 3.5);
  assert(t.value, 0.25 + Math.PI / 6);
});
//复合多元函数测试

test('v = a*x + b*y + 1*z', (assert) => {
  const a = Node.varb('a');
  const b = Node.varb('b');
  const const1 = Node.constant(1);
  const x = Node.varb('x');
  const y = Node.varb('y');
  const z = Node.varb('z');
  const vt = sigmod(sum(mul(a, x), mul(b, y), mul(const1, z)));
  const dt = vt.deriv(x);
  a.value = 1;
  b.value = 2;
  x.value = 3;
  y.value = 4;
  z.value = 2;
  assert(dt.value, 0.0000022603);
  a.value = 2;
  assert(dt.value, 2.2499997464e-7);
});
//任意变量求值
//任意变量求导测试
