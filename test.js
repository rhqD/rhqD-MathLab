const test = (describe, testBody) => {
  console.log(describe);
  const log = (message) => {
    console.log(`****${message}`);
  };
  const error = (message) => {
    console.error(`****${message}`);
  };
  const assert = (a, b, message = '') => {
    if (a === b){
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
