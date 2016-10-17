/**
 * Mito.js
 * A simple template engine
 *
 * @author Maiz
 */

export default function render(tpl, data, toString) {
  let pattern = /\{\{([^\}]+)\}\}/g,
    code = 'var arr = [];\n',
    pointer = 0,
    match = [];
  let addCode = function(line, isJS) {
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
  // remove spaces after switch
  tpl = tpl.replace(/(\{\{ ?switch(.+?)\}\})[\r\n\t ]+\{\{/g, '$1{{');
  // line breaks
  tpl = tpl.replace(/^\n/, '').replace(/\n/g, '\\\n');
  // extract {{code}}
  while (match = pattern.exec(tpl)) {
    addCode( tpl.slice(pointer, match.index), false );
    addCode( match[1], true );
    pointer = match.index + match[0].length;
  }
  addCode( tpl.substr(pointer, tpl.length - pointer), false );
  code += 'return arr.join("");';
  code = 'with (this) {\n' + code + '\n}';
  // console.log("code:\n"+code);
  let dom = (new Function(code)).apply(data);
  if (!toString) {
    let e = document.createElement('div');
    e.innerHTML = dom;
    dom = e.children[0];
  }
  return dom;
}
