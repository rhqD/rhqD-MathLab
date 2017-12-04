# rhqD-MathLab
数学函数求值和求导
让你以十分优雅的方式写数学函数，并十分简单的实现对其求导。
## 简单示例
```javascript 
test('y = sinx, z = y ^ 2, w = 2 * z, v = w + 3', (assert) => {
  //生成变量x
  const x = Node.varb('x');
  //生成常量2
  const const2 = Node.constant(2);
  //生成常量3
  const const3 = Node.constant(3);
  //y = sin(x)
  const y = sin(x);
  //z = y ^ 2
  const z = square(y);
  //w = 2 * z
  const w = mul(const2, z);
  //v = w + 3
  const v = add(w, const3);
  //t = x + z
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
```


