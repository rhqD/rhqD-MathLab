const test = (describe, testBody) => {
  console.log(describe);
  const log = (message) => {
    console.log(`****${message}`);
  };
  const error = (message) => {
    console.error(`****${message}`);
  };
  const assert = (a, b, message = '') => {
    if (a - b < 0.00000001){
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

const const1 = rhq.const(1);
const const2 = rhq.const(2);
const x = rhq.var('x');
const a2x = mul(x, const2);
const b2x = add(x, x);
const c2x = mul(const2, x);
const y = rhq.var('y');
const sinx = sin(x);
const cosx = cos(x);
//一元函数测试
test('test y = x', (assert) => {
  const vf = rhq.getValueFunc(x, x);
  const df1 = rhq.getValueFunc(rhq.getDiffTensor(x, x), x);
  const df2 = rhq.getValueFunc(rhq.getDiffTensor(x, x));
  assert(vf(1), 1);
  assert(vf(2), 2);
  assert(vf(4), 4);
  assert(df1(1), 1);
  assert(df1(2), 1);
  assert(df2(2), 1);
  assert(df2(2), 1);
});


test('test y = 2 * x', (assert) => {
  const vf1 = rhq.getValueFunc(a2x, x);
  const vf2 = rhq.getValueFunc(b2x, x);
  const vf3 = rhq.getValueFunc(c2x, x);
  const df1 = rhq.getValueFunc(rhq.getDiffTensor(a2x, x), x);
  const df2 = rhq.getValueFunc(rhq.getDiffTensor(b2x, x), x);
  const df3 = rhq.getValueFunc(rhq.getDiffTensor(c2x, x), x);
  assert(vf1(1), 2, '1 * 2 = 2');
  assert(vf2(1), 2, '1 + 1 = 2');
  assert(vf3(1), 2, '2 * 1 = 2');
  assert(vf1(2), 4, '2 * 2 = 4');
  assert(vf2(2), 4, '2 + 2 = 4');
  assert(vf3(2), 4, '2 * 2 = 4');
  assert(vf1(7), 14, '7 * 2 = 14');
  assert(vf2(7), 14, '7 + 7 = 14');
  assert(vf3(7), 14, '2 * 7 = 14');
  assert(df1(1), 2);
  assert(df2(1), 2);
  assert(df3(1), 2);
  assert(df1(2), 2);
  assert(df2(2), 2);
  assert(df3(2), 2);
  assert(df1(3), 2);
  assert(df2(3), 2);
  assert(df3(3), 2);
});

test('test y = 2 * x + 1', (assert) => {
  const a2xPlus1 = add(a2x, const1);
  const vf = rhq.getValueFunc(a2xPlus1, x);
  const df = rhq.getValueFunc(rhq.getDiffTensor(a2xPlus1, x), x);
  assert(vf(2), 5);
  assert(vf(7), 15);
  assert(vf(9), 19);
  assert(df(1), 2);
  assert(df(3), 2);
  assert(df(17), 2);
});

test('test y = sin(x)', (assert) => {
  const vf = rhq.getValueFunc(sinx, x);
  const df = rhq.getValueFunc(rhq.getDiffTensor(sinx, x), x);
  assert(vf(0), 0, 'sin(0) = 0');
  assert(vf(Math.PI), Math.sin(Math.PI), 'sin(PI) = 0');
  assert(vf(Math.PI / 6), Math.sin(Math.PI / 6), 'sin(PI / 6) = 0.5');
  assert(df(0), 1, 'sin\'(0) = cos(0) = 1');
  assert(df(Math.PI / 3), Math.cos(Math.PI / 3), 'sin\'(PI / 3) = cos(PI / 3) = 0.5');
});

test('test y = sin(2x + 1)', (assert) => {
  const vt = sin(add(a2x, const1));
  const vf = rhq.getValueFunc(vt, x);
  const df = rhq.getValueFunc(rhq.getDiffTensor(vt, x), x);
  assert(vf(1), Math.sin(3));
  assert(vf(0), Math.sin(1));
  assert(df(0), 2 * Math.cos(1));
  assert(df(1), 2 * Math.cos(3));
});

test('test y = arcsin(x)', (assert) => {
  const vt = arcsin(x);
  const vf = rhq.getValueFunc(vt, x);
  const df = rhq.getValueFunc(rhq.getDiffTensor(vt, x), x);
  assert(vf(1), Math.PI / 2);
  assert(vf(0.5), Math.PI / 6);
  assert(df(0), 1);
  assert(df(0.6), 1.25);
});

test('test y = cos(x)', (assert) => {
  const vf = rhq.getValueFunc(cosx, x);
  const df = rhq.getValueFunc(rhq.getDiffTensor(cosx, x), x);
  assert(vf(0), 1, 'cos(0) = 1');
  assert(vf(1), Math.cos(1));
  assert(df(0), 0, 'cos\'(0) = 0');
  assert(df(1), 0 - Math.sin(1));
});

test('test y = arccos(x)', (assert) => {
  const vt = arccos(x);
  const vf = rhq.getValueFunc(vt, x);
  const dt = rhq.getDiffTensor(vt, x);
  const df = rhq.getValueFunc(dt, x);
  assert(vf(1), Math.acos(1));
  assert(vf(0.8), Math.acos(0.8));
  assert(df(0), -1);
  assert(df(0.6), -1.25);
});

test('test y = tan(x)', (assert) => {
  const vt = tan(x);
  const vf = rhq.getValueFunc(vt, x);
  const df = rhq.getValueFunc(rhq.getDiffTensor(vt, x), x);
  assert(vf(0), 0);
  assert(vf(Math.PI / 3), Math.tan(Math.PI / 3));
  assert(df(0), 1);
  assert(df(Math.PI / 3), 4);
});

test('test y = exp(x)', (assert) => {
  const vt = exp(x);
  const vf = rhq.getValueFunc(vt, x);
  const df = rhq.getValueFunc(rhq.getDiffTensor(vt, x), x);
  assert(vf(0), 1);
  assert(vf(2), Math.E * Math.E);
  assert(df(0), 1);
  assert(df(2), Math.E * Math.E);
});

test('test y = ln(x)', (assert) => {
  const vt = ln(x);
  const vf = rhq.getValueFunc(vt, x);
  const df = rhq.getValueFunc(rhq.getDiffTensor(vt, x), x);
  assert(vf(1), 0);
  assert(vf(Math.E), 1);
  assert(df(2), 0.5);
  assert(df(3), 1 / 3);
});

test('test y = neg(x)', (assert) => {
  const vt = neg(x);
  const vf = rhq.getValueFunc(vt, x);
  const df = rhq.getValueFunc(rhq.getDiffTensor(vt, x), x);
  assert(vf(0), 0);
  assert(vf(1), -1);
  assert(df(1), -1);
  assert(df(3), -1);
});

test('test y = sigmod(x)', (assert) => {
  const vt = sigmod(x);
  const vf = rhq.getValueFunc(vt, x);
  const df = rhq.getValueFunc(rhq.getDiffTensor(vt, x), x);
  assert(vf(0), 1);
  assert(vf(1), 1 / (1 + 1 / Math.E));
  assert(df(1), vf(1) * (1 - vf(1)));
  assert(df(2), vf(2) * (1 - vf(2)));
});

test('test y = square(x)', (assert) => {
  const vt = square(x);
  const vf = rhq.getValueFunc(vt, x);
  const df = rhq.getValueFunc(rhq.getDiffTensor(vt, x), x);
  assert(vf(1), 1);
  assert(vf(2), 4);
  assert(vf(3), 9);
  assert(df(1), 2);
  assert(df(2), 4);
  assert(df(3), 6);
});

//二元函数测试
test('test y = pow(x, y)', (assert) => {
  const vt = pow(x, y);
  const vf = rhq.getValueFunc(vt, x, y);
  const dfx = rhq.getValueFunc(rhq.getDiffTensor(vt, x), x, y);
  const dfy = rhq.getValueFunc(rhq.getDiffTensor(vt, y), x, y);
  assert(vf(1, 2), 1, '1^2 = 1');
  assert(vf(3, 3), 27, '3^3 = 27');
  assert(vf(2, 4), 16, '2^4 = 16');
  //y*(x^(y-1))
  assert(dfx(1, 0), 0, '0*(1^-1) = 0');
  assert(dfx(2, 3), 12, '3*(2^2) = 12');
  assert(dfx(3, 3), 27, '3*(3^2) = 27');
  //ln(y)*(x^y)
  assert(dfy(2, 2), Math.log(2) * 4);
  assert(dfy(3, 5), Math.log(5) * 162);
  assert(dfy(1, 3), 0);
});

test('test y = pow(x, 2)', (assert) => {
  const vt = pow(x, const2);
  const vf = rhq.getValueFunc(vt, x);
  const dfx = rhq.getValueFunc(rhq.getDiffTensor(vt, x), x);
  assert(vf(1), 1, '1^2 = 1');
  assert(vf(2), 4, '2^2 = 4');
  assert(vf(3), 9, '3^2 = 9');
  assert(dfx(3), 6);
  assert(dfx(2), 4);
  assert(dfx(5), 10);
});

test('test y = pow(2, x)', (assert) => {
  const vt = pow(const2, x);
  const vf = rhq.getValueFunc(vt, x);
  const dfx = rhq.getValueFunc(rhq.getDiffTensor(vt, x), x);
  assert(vf(1), 2, '2^1 = 2');
  assert(vf(3), 8, '2^3 = 8');
  assert(vf(4), 16, '2^4 = 16');
  // ln(2)*(2^x)
  const ln2 = Math.log(2);
  assert(dfx(3), ln2 * 8);
  assert(dfx(2), ln2 * 4);
  assert(dfx(7), ln2 * 128);
});

test('test y = x + y', (assert) => {
  const vt = add(x, y);
  const vf = rhq.getValueFunc(vt, x, y);
  const dfx = rhq.getValueFunc(rhq.getDiffTensor(vt, x), x, y);
  const dfy = rhq.getValueFunc(rhq.getDiffTensor(vt, y), x, y);
  assert(vf(1, 2), 3);
  assert(vf(2, 4), 8);
  assert(vf(3, 7), 10);
  assert(dfx(1, 6), 1);
  assert(dfx(2, 4), 1);
  assert(dfx(3, 5), 1);
  assert(dfy(4, 7), 1);
  assert(dfy(5, 8), 1);
  assert(dfy(6, 9), 1);
});

test('test y = 2x + 3y', (assert) => {
  const vt = add(mul(const2, x), mul(rhq.const(3), y));
  const vf = rhq.getValueFunc(vt, x, y);
  const dfx = rhq.getValueFunc(rhq.getDiffTensor(vt, x), x, y);
  const dfy = rhq.getValueFunc(rhq.getDiffTensor(vt, y), x, y);
  assert(vf(1, 2), 8);
  assert(vf(2, 3), 13);
  assert(vf(0, 4), 12);
  assert(dfx(1, 3), 2);
  assert(dfx(3, 7), 2);
  assert(dfx(5, 7), 2);
  assert(dfy(3, 4), 3);
  assert(dfy(6, 7), 3);
  assert(dfy(5, 9), 3);
});

// test('test y = x - y', (assert) => {
//   const vt = ();
//   const vf = rhq.getValueFunc(vt, x, y);
//   const dfx = rhq.getValueFunc(rhq.getDiffTensor(vt, x), x, y);
//   const dfy = rhq.getValueFunc(rhq.getDiffTensor(vt, y), x, y);
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
//   const vf = rhq.getValueFunc(vt, x, y);
//   const dfx = rhq.getValueFunc(rhq.getDiffTensor(vt, x), x, y);
//   const dfy = rhq.getValueFunc(rhq.getDiffTensor(vt, y), x, y);
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
//   const vf = rhq.getValueFunc(vt, x, y);
//   const dfx = rhq.getValueFunc(rhq.getDiffTensor(vt, x), x, y);
//   const dfy = rhq.getValueFunc(rhq.getDiffTensor(vt, y), x, y);
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
//   const vf = rhq.getValueFunc(vt, x, y);
//   const dfx = rhq.getValueFunc(rhq.getDiffTensor(vt, x), x, y);
//   const dfy = rhq.getValueFunc(rhq.getDiffTensor(vt, y), x, y);
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
//   const vf = rhq.getValueFunc(vt, x, y);
//   const dfx = rhq.getValueFunc(rhq.getDiffTensor(vt, x), x, y);
//   const dfy = rhq.getValueFunc(rhq.getDiffTensor(vt, y), x, y);
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
//   const vf = rhq.getValueFunc(vt, x, y);
//   const dfx = rhq.getValueFunc(rhq.getDiffTensor(vt, x), x, y);
//   const dfy = rhq.getValueFunc(rhq.getDiffTensor(vt, y), x, y);
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
//   const vf = rhq.getValueFunc(vt, x, y);
//   const dfx = rhq.getValueFunc(rhq.getDiffTensor(vt, x), x, y);
//   const dfy = rhq.getValueFunc(rhq.getDiffTensor(vt, y), x, y);
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
//   const vf = rhq.getValueFunc(vt, x, y);
//   const dfx = rhq.getValueFunc(rhq.getDiffTensor(vt, x), x, y);
//   const dfy = rhq.getValueFunc(rhq.getDiffTensor(vt, y), x, y);
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
//   const vf = rhq.getValueFunc(vt, x, y);
//   const dfx = rhq.getValueFunc(rhq.getDiffTensor(vt, x), x, y);
//   const dfy = rhq.getValueFunc(rhq.getDiffTensor(vt, y), x, y);
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
//   const vf = rhq.getValueFunc(vt, x, y);
//   const dfx = rhq.getValueFunc(rhq.getDiffTensor(vt, x), x, y);
//   const dfy = rhq.getValueFunc(rhq.getDiffTensor(vt, y), x, y);
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
//   const vf = rhq.getValueFunc(vt, x, y);
//   const dfx = rhq.getValueFunc(rhq.getDiffTensor(vt, x), x, y);
//   const dfy = rhq.getValueFunc(rhq.getDiffTensor(vt, y), x, y);
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
//   const vf = rhq.getValueFunc(vt, x, y);
//   const dfx = rhq.getValueFunc(rhq.getDiffTensor(vt, x), x, y);
//   const dfy = rhq.getValueFunc(rhq.getDiffTensor(vt, y), x, y);
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
//   const vf = rhq.getValueFunc(vt, x, y);
//   const dfx = rhq.getValueFunc(rhq.getDiffTensor(vt, x), x, y);
//   const dfy = rhq.getValueFunc(rhq.getDiffTensor(vt, y), x, y);
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
//   const vf = rhq.getValueFunc(vt, x, y);
//   const dfx = rhq.getValueFunc(rhq.getDiffTensor(vt, x), x, y);
//   const dfy = rhq.getValueFunc(rhq.getDiffTensor(vt, y), x, y);
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
//   const vf = rhq.getValueFunc(vt, x, y);
//   const dfx = rhq.getValueFunc(rhq.getDiffTensor(vt, x), x, y);
//   const dfy = rhq.getValueFunc(rhq.getDiffTensor(vt, y), x, y);
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
//复合多元函数测试
//任意变量求值
//任意变量求导测试
