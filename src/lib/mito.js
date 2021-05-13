/**
 * Mito.js
 * A simple template engine
 *
 * @author Maiz
 */

export default function render(tpl, data, toString) {
  let pattern = /\{\{([^\}]+)\}\}/g,
    code = '',
    codeWrap = '',
    pointer = 0,
    match = [];
  const RenderFunction = {
    // Escape HTML to XSS-safe text
    text: (text) => {
      if (typeof text !== 'string' && typeof text !== 'number') { return text; }
      return String(text).replace(/[<>&" ]/g, (c) => {
        return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', ' ': '&nbsp;' }[c];
      });
    },
    // Change invisible characters to visible characters
    visibleText: (text) => {
      if (typeof text !== 'string') { return text; }
      return String(text).replace(/[\n\t]/g, (c) => {
        return { '\n': '\\n', '\t': '\\t' }[c];
      });
    },
  };
  const addCode = (line, isJS) => {
    if (line === '') { return; }
    // console.log(line)
    if (isJS) {
      if ( line.match(/^ ?else/g) ) {
        // else  --> } else {
        code += '} ' + line + ' {\n';
      } else if ( line.match(/\/(if|for|switch)/g) ) {
        // /if  -->  }
        code += '}\n';
      } else if ( line.match(/^ ?if|for|switch/g) ) {
        // if (age)  -->  if (this.age) {
        code += line + ' {\n';
      } else if ( line.match(/^ ?(break|continue) ?$/g) ) {
        // break --> break;
        code += line + ';\n';
      } else if ( line.match(/^ ?(case|default)/g) ) {
        // case (1) --> case (1):
        code += line + ':\n';
      } else {
        // name  -->  name
        code += 'arr.push('+ line +');\n';
      }
    } else {
      // plain text
      code += 'arr.push("' + line.replace(/"/g, '\\"' )+ '");\n';
    }
  };
  // init global param
  window.__mito_data = data;
  window.__mito_code = "";
  window.__mito_result = "";
  // remove spaces after switch
  tpl = tpl.replace(/(\{\{ ?switch(.+?)\}\})[\r\n\t ]+\{\{/g, '$1{{');
  // line breaks
  tpl = tpl.replace(/^[\r\n]/, '').replace(/\n/g, '\\\n').replace(/\r/g, '\\\r');
  // init code
  codeWrap = '(function(){\n';
  code = 'var arr = [];\n';
  // renderFunctions
  for (let fn in RenderFunction) {
    code += `var ${fn} = ${RenderFunction[fn].toString()};\n`;
  }
  while (match = pattern.exec(tpl)) {
    addCode( tpl.slice(pointer, match.index), false );
    addCode( match[1], true );
    pointer = match.index + match[0].length;
  }
  addCode( tpl.substr(pointer, tpl.length - pointer), false );
  code += '__mito_result = arr.join("");';
  code = 'with (__mito_data) {\n' + code + '\n}';
  codeWrap += code;
  codeWrap += '})();';
  // console.log("code:\n"+codeWrap);
  // run code, do NOT use `eval` or `new Function` to avoid `unsafe-eval` CSP rule
  let scriptList = document.getElementsByTagName('script');
  let nonce = '';
  // find the first script with nonce
  for (let script of scriptList) {
    if (script.nonce) {
      nonce = script.nonce
      break
    }
  }
  
  let script = document.createElement('SCRIPT');
  script.innerHTML = codeWrap;
  script.setAttribute('nonce', nonce);
  document.documentElement.appendChild(script);
  let dom = __mito_result;
  document.documentElement.removeChild(script);
  if (!toString) {
    let e = document.createElement('DIV');
    e.innerHTML = dom;
    dom = e.children[0];
  }
  return dom;
}
