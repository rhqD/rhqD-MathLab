import Node from './Node';
const { integral, mul, neg, add } = Node.functions;

const transformations = [
    {
        // ?C * f(x) => c*?f(x)
        apply: (exp) => {
            const y = exp.varbs[0];
            const x = exp.varbs[1];
            const constantIndex = y.varbs.findIndex(n => n.independentFrom(x));
            if (y.opName === 'mul' && constantIndex > -1) {
                return mul(y.varbs[constantIndex], integral(y.varbs[constantIndex === 0 ? 1 : 0], x))
            }
            return exp;
        },
        safe: true,
    },
    {
        // ?-f(x) => -?f(x)
        apply: (exp) => {
            const y = exp.varbs[0];
            const x = exp.varbs[1];
            if (y.opName === 'neg') {
                return neg(integral(y.varbs[0], x));
            }
            return exp;
        },
        safe: true,
    },
    {
        // ?f(x) + g(x) => ?f(x) + ?g(x)
        apply: (exp) => {
            const y = exp.varbs[0];
            const x = exp.varbs[1];
            if (y.opName === 'add') {
                return add(
                    integral(y.varbs[0], x),
                    integral(y.varbs[1], x),
                )
            }
            return exp;
        },
        safe: true,
    },
    {
        //
        apply: (exp) => {
            const y = exp.varbs[0];
            const x = exp.varbs[1];
            const targets = y.find(node =>
                node.opName = 'add'
                && node.varbs.some(varb => varb.independentFrom(x))
                && node.varbs.some(varb =>
                    varb.opName === 'mul'
                    && varb.varbs.some(item => item === x)
                    && varb.varbs.some(item => item.independentFrom(x))
                )
            );
        }
    }
];
