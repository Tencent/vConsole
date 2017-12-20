if (typeof Symbol === 'undefined') {

  window.Symbol = function Symbol() {
  };
  
  const key = '__symbol_iterator_key';
  window.Symbol.iterator = key;
  
  Array.prototype[key] = function symbolIterator() {
    const that = this;
    let i = 0;
    return {
      next() {
        return {
          done: that.length === i,
          value: that.length === i ? undefined : that[i++]
        };
      }
    };
  };

}