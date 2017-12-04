const _ = require('lodash');

class Node {
  static varb(name){
    const p = new Node({name, caculated: true});
    p.toExpression = () => (p.name);
    return p;
  };

  static constant(x){
    const p = new Node({
      op: () => (x),
      value: x,
      varbs: [],
      isConstant: true,
      caculated: true
    });
    p.toExpression = () => (p.value);
    return p;
  };

  // _isConstant = false;
  // _value = null;
  // varbs = [];
  // fathers = [];
  // op = null;
  // _diffs = null;
  // _caculated = false;
  // _diffGetters = null;
  // _name = '';
  constructor({op = null, opName = '', varbs = [], diffGetters = [], isConstant = false, name = '', caculated = false, value = null}){
    this.fathers = [];
    this.op = op;
    this.varbs = varbs;
    this._diffGetters = diffGetters;
    this._isConstant = isConstant;
    this._name = name;
    this._caculated = caculated;
    this._value = value;
    this.opName = opName;
  }

  get name(){
    if (this._isConstant){
      return `CONSTANT ${this._value}`;
    }
    if (_.isFunction(this._name)){
      return this._name();
    }
    return this._name;
  }

  get diffs(){
    if (!_.isArray(this._diffs)){
      this._diffs = this._diffGetters.map((getter) => (getter(...this.varbs)));
    }
    return this._diffs;
  };

  get value(){
    if (this._caculated){
      //节点值已计算过，直接返回
      return this._value;
    } else {
      //节点值仍未计算，开始计算
      if (this._isConstant){
        //如果收常数则直接返回_value
        return this._value;
      }
      const args = this.varbs.map((item) => {
        const result = item.value;
        if (!_.isNumber(result) || _.isNaN(result)){
          throw('cant caculate value, not all varbs ha value');
        }
        return result;
      });
      const value = this.op(...args);
      this._value = value;
      this._caculated = true;
      return value;
    }
  }

  set value(v){
    if (_.isEmpty(this.varbs)){
      //叶子结点，可以修改value
      this._value = v;
      this.fathers.forEach((item) => {
        item.spreadDirtyStatus();
      })
    } else {
      //非叶子节点，不允许修改
      throw('非叶子节点，不允许修改value');
    }
  }

  //修改叶子节点value后，自下而上传播脏状态
  spreadDirtyStatus(){
    //如果发现父节点已经被标记为未计算则停止传播，因为整套逻辑可以保证一定不会出现，父节点是已计算状态，但是子节点还是未计算状态
    if (this._caculated){
      this._caculated = false;
      this.fathers.forEach((item) => {
        item.spreadDirtyStatus();
      });
    }
  }

  //将所有对当前节点的以来，替换为新节点
  replaceMeWith(node){
    //先将当前节点从所有的子节点的fathers中移除
    this.varbs.forEach((varb) => {
      varb.fathers = varb.fathers.filter((father) => (father !== this));
    });
    this.fathers.forEach((father) => {
      node.fathers.push(father);
      father.varbs = father.varbs.map((varb) => (varb === this ? node : varb));
    });
  }

  optimize(){
    const len = this.varbs.length;
    //先优化子节点，再优化当前节点
    for(let i = 0; i < len; i++){
      this.varbs[i].getOptimizedNode();
    }
  }

  deriv(varb){

  }

  //优化节点（包括当前节点），主要针对1*x,0*x,0+x的情况
  getOptimizedNode(){
    const len = this.varbs.length;
    //先优化子节点，再优化当前节点
    for(let i = 0; i < len; i++){
      this.varbs[i].getOptimizedNode();
    }
    const consts = this.varbs.filter((varb) => (varb._isConstant));
    if (consts.length === this.varbs.length && consts.length !== 0){
      //全是常数的情况
      const varbValues = this.varbs.map((varb) => (varb.value));
      const value = this.op(...varbValues);
      const newNode = Node.constant(value);
      this.replaceMeWith(newNode);
      return newNode;
    } else if (consts.length == 1 && this.varbs.length === 2){
      //有一个常数的情况
      const constValue = consts[0].value;
      //不是常数的那个变量的索引
      const nonConstantIndex = _.findIndex(this.varbs, (varb) => (!varb._isConstant));
      let newNode = null;
      if (constValue === 1 && this.opName === 'mul'){
        //1*x的情况
        newNode = this.varbs[nonConstantIndex];
      }
      if (constValue === 0 && this.opName === 'add'){
        //0+x的情况
        newNode = this.varbs[nonConstantIndex];
      }
      if (constValue === 0 && this.opName === 'mul'){
        //0*x的情况
        newNode = consts[0];
      }
      if (newNode !== null){
        this.replaceMeWith(newNode);
        return newNode;
      }
    }
    return this;
  }
}

module.exports = Node;
