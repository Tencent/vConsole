import Vue from './vue.min.js'
import VConsole from '../../dist/vconsole.min.js';

new Vue({
  el: '#app',
  data() {
    return {
      msg: 'Hello vConsole for test.'
    };
  },
  mounted() {
    new VConsole();
    console.log('Hello vConsole for test.');
  }
});

