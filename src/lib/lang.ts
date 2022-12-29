// https://webpack.js.org/guides/dependency-management/#requirecontext
const modulesFiles = require.context('./lang', true, /\.js$/)

// you do not need `import app from './modules/app'`
// it will auto require all vuex module from modules file
const modules = modulesFiles.keys().reduce((modules, modulePath) => {
  // set './app.js' => 'app'
  const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1')
  const value = modulesFiles(modulePath)
  modules[moduleName] = value.default
  return modules
}, {})


function curry(f) {
  return function(a:string) {
    return function(b:string) {
      return f(a, b);
    };
  };
}

const translate = function (lang: string, str: string):string {
  if(modules[lang] && modules[lang][str]) {
    return modules[lang][str]
  } else {
    return str
  }
}

let curryTranslate = curry(translate);

export function i18n(arg1:string){
   return curryTranslate(arg1)
}

