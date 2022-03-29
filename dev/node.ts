import * as tool from '../src/lib/tool';
const massiveData = require('./data/massive.json');
// console.log('massiveData:', massiveData);

const ret = tool.safeJSONStringify(massiveData, { maxDepth: 10, keyMaxLen: 5000, pretty: true });
console.log(ret);
