const { JSDOM } = require('jsdom');
const VConsole = require('../');
const tool = VConsole.tool;

const { window } = new JSDOM(`...`);

const str = tool.safeJSONStringify(window, 5, 100000000);
console.log(str);
