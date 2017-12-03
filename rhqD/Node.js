const _ = require('lodash');
class Node {

  // _isConstant = false;
  // _value = null;
  // varbs = [];
  // fathers = [];
  // op = null;
  // _diffs = null;
  // _caculated = false;
  // _diffGetters = null;
  // _name = '';
  constructor({op = null, varbs = [], diffGetters = [], isConstant = false, name = '', caculated = false, value = null}){
    this.fathers = [];
    this.op = op;
    this.varbs = varbs;
    this._diffGetters = diffGetters;
    this._isConstant = isConstant;
    this._name = name;
    this._caculated = caculated;
    this._value = value;
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
      this._caculated = false;
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
}

module.exports = Node;
