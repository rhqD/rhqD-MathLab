const mm = (m1, m2) => {
  const m1i = m1.length;
  const m1j = m1[0].length;
  const m2i = m2.length;
  const m2j = m2[0].length;
  if (m1j !== m2i){
    throw('illegal matrixs size');
  }
  const result = [];
  for(let i = 0; i < m1i; i++){
    for(let j = 0; j < m2j;j++){
      _.set(result, [i, j], vm(IV(m1, i), JV(m2, j)));
    }
  }
  return result;
}
//取矩阵第i行向量（不分行向量或者列向量）
const IV = (m, i) => (m[i]);
//取矩阵第列向量（不分行向量或者列向量）
const JV = (m, j) => (m.map((item) => (item[j])));

const vm = (v1, v2) => {
  if (v1.length !== v2.length || v1.length === 0){
    throw('illegal vector size');
  }
  const subResults = v1.map((item, index) => (mul(item, v2[index])));
  return sum(...subResults);
}

const sigmodM = (m) => (m.map((row) => (row.map((ele) => (sigmod(ele))))));
