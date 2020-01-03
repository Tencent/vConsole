// index.js
const VConsole = require('../src/vconsole')

const vc = new VConsole()

console.log(vc)
console.log('start test mock vconsole')

window.fetch('http://localhost:8080/dev/data.json?fetch=test',{method:'GET'}).then(data => {
    console.log('use fetch response data: ', data)
})

const xhr = new XMLHttpRequest()
xhr.open('get','http://localhost:8080/dev/data.json?xhr=ajax')
xhr.send()