
const x = rhq.var();
const y = rhq.var();
const const2 = rhq.const(2);

const sinx = sin(x);
const cosy = cos(y);
const z = pow(sinx, cosy);

const {v, d} = rhq.generate(x, x);
console.log(v(2));
