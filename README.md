# rhqD-MathLab
数学函数求值和求导
让你以十分优雅的方式写数学函数，并十分简单的实现对其求导。
从而以此实现一些机器学习的算法

## 基本思路
```javascript 
  //Node.varb用于生成变量
  const x = Node.varb('x');//可选参数'x'代表变量x的name，建议与变量名保持一致
  //Node.constant用于生成常量
  const const2 = Node.constant(2);//参数2代表常量的值（必选参数）
```
### 生成了变量后就可以对变量进行运算来得到更复杂的数学变量了，变量的运算主要通过内置的一系列基本函数来实现。提供的内置函数主要有：
```javascript
{
  //一元函数
  sin,
  cos,
  arccos,
  arcsin,
  tan,
  ln,
  exp,
  neg,
  sigmod,
  tanh,
  square,
  //二元函数
  pow,//x^y
  add,
  minus,
  mul,//x*y
  div,//x/y
  log//log(x, y)
}
// z = 2x + 3y
const x = Node.varb('x');
const y = Node.varb('y');
const const2 = Node.constant(2);
const const3 = Node.constant(3);
const z = add(mul(const2, x), mul(const3, y));
```


