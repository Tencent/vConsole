 /**
   * Get all lang file.
   */
const modulesFiles = require.context('./lang', true, /\.js$/);
const modules = modulesFiles.keys().reduce((modules, modulePath) => {
  const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1');
  const value = modulesFiles(modulePath);
  modules[moduleName] = value.default;
  return modules;
}, {})


function curry(f) {
  return function(a:string) {
    return function(b:string) {
      return f(a, b);
    };
  };
}

const translate = function (lang: string, str: string):string {
  if(modules[lang]?.[str]) {
    return modules[lang][str];
  } else {
    return str;
  }
}
let curryTranslate = curry(translate);

export function i18n(arg1:string){
   return curryTranslate(arg1);
}

