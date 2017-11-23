
const x = rhq.var();
const y = rhq.var();

const yT = pow(x, y);

const {v} = rhq.generate(yT, x, y);
console.log(v(2, 3));
