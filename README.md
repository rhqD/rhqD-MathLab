# rhqD-MathLab
数学函数求值和求导  
让你以十分优雅的方式写数学函数，并十分简单的实现对其求导。从而以此实现一些机器学习的算法

## 基本思路
任何复杂的数学表达式都可以用一张有向图来表示。所有的节点分为两类  
(1) 叶子结点(不依赖于任何其他节点的节点)  
(2) 非叶节点  
当构造出这样一张图后，我们就可以实现任意节点的求值。但是只有当一个节点依赖的所有叶节点都有值时这个几点的值才是可计算的。  
同时利用复合函数求导法则，我们可以实现图中任意节点对其他节点的求导。
```javascript
  //Node.varb用于生成变量
  const x = Node.varb('x');//可选参数'x'代表变量x的name，建议与变量名保持一致
  //Node.constant用于生成常量
  const const2 = Node.constant(2);//参数2代表常量的值（必选参数）
```
生成了变量后就可以对变量进行运算来得到更复杂的数学变量了，变量的运算主要通过内置的一系列基本函数来实现。  
提供的内置函数主要有：
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
/*
变量z依赖于x和y，所以当x和y都有值时，z.value才有值
x.value = 1;
y.value = 2;
z.value === 8;
改变x或y的值，z的值也会随之改变
x.value = 2;
z.value === 10;
*/
```
## 求导
```javascript
const a = Node.varb('a');
const b = Node.varb('b');
const const1 = Node.constant(1);
const x = Node.varb('x');
const y = Node.varb('y');
const z = Node.varb('z');
const v = sigmod(sum(mul(a, x), mul(b, y), mul(const1, z)));//v = a*x + b*y + 1*z
//vt.deriv(x),既vt对x求偏导数
const vdx = v.deriv(x);
a.value = 1;
b.value = 2;
x.value = 3;
y.value = 4;
z.value = 2;
assert(vdx.value, 0.0000022603);
//当某一变量值改变后，导数的值也会改变。
a.value = 2;
assert(vdx.value, 2.2499997464e-7);
```
## 性能
为了提高性能，图中每一个节点的value都只会在需要计算时才计算。如果一个节点的value已经计算过，那么再次访问这个节点的value属性时会返回上次的值。  
那么如何保证当某个节点的值改变后，所有依赖他的节点的值也能更新呢。  
当改变某个节点的值时，会自动向上查找所有依赖这个节点的节点，并将其标记为dirty，那么下次访问这些的节点的value属性时会重新计算。这样就可以保证没有任何不必要的计算。  
对于一张很大的图，同时对他依赖的多个叶子节点的value进行赋值，那么上述操作就会执行多次，但是当上溯到某个节点并发现这个节点已经被标记为dirty时就会终止上溯，所以即便将所有的叶节点的value都改变，也不过是相当于把整个图遍历一遍。  
在使用时要尽可能的避免对相同的表达式生成不同的节点。因为虽然这两个节点的值始终是一样的，但是这两个节点的值仍然会分开计算。
