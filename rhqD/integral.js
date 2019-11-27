const transformations = [
    {
        check: (exp) => {
            const y = exp.varbs[0];
            return y.opName === 'add' && y.varbs.some(n => n.isConstant);
        },
        apply: (exp) => {
            const y = exp.varbs[0];
            const x = exp.varbs[1];
            const constantIndex = y.varbs.findIndex(n => n.isConstant);
            return mul(constantIndex, integral(y.varbs[constantIndex === 0 ? 1 : 0], x))
        },
        safe: true,
    },
    {
        check: (exp) => {
            return y.opName === 'neg';
        },
        apply: (exp) => {
            const y = exp.varbs[0];
            const x = exp.varbs[1];
            return neg(integral(y.varbs[0], x));
        },
        safe: true,
    }
];