describe("vConsole", function() {

  var assert = require('chai').assert;
  var util = require('util');
  var jsdom = require('jsdom');

  it('touch event', function(done) {
    jsdom.env('test/log.html', function(err, window) {
      var document = window.document;

      window.localStorage = {
        getItem: function (key) {
            return this[key];
        },
        setItem: function (key, value) {
            this[key] = String(value);
        }
      };
      global.localStorage = window.localStorage;

      var vcSwitch = document.querySelector('.vc-switch');

      var eventTouchstart = document.createEvent('Event');
      eventTouchstart.initEvent('touchstart', true, true);
      var point = { x: 10, y: 10 };
      eventTouchstart.touches = [{
        identifier: Math.random(),
        pageX: point.x,
        pageY: point.y,
        screenX: point.x,
        screenY: point.y,
        clientX: point.x,
        clientY: point.y
      }];
      vcSwitch.dispatchEvent(eventTouchstart);

      var eventTouchmove = document.createEvent('Event');
      eventTouchmove.initEvent('touchmove', true, true);
      var point = { x: 12, y: 12 };
      eventTouchmove.touches = [{
        identifier: Math.random(),
        pageX: point.x,
        pageY: point.y,
        screenX: point.x,
        screenY: point.y,
        clientX: point.x,
        clientY: point.y
      }];
      vcSwitch.dispatchEvent(eventTouchmove);

      var eventTouchend = document.createEvent('Event');
      eventTouchend.initEvent('touchend', true, true);
      vcSwitch.dispatchEvent(eventTouchend);
      setTimeout(function () {
        assert.equal(localStorage.vConsole_switch_x, '8');

        global.localStorage = null;
        window.localStorage = null;
        done();
      }, 100);
    }, {
      features: {
        FetchExternalResources: ["link", "script"]
      }
    });
  });

  it('log.html', function(done) {
    jsdom.env('test/log.html', function(err, window) {
      var document = window.document;

      assert.equal(document.querySelector('#__vconsole') !== null, true);

      document.querySelector('.weui_btn.weui_btn_default:nth-of-type(1)').click(); // formattedLog
      assert.equal(document.querySelector('.vc-logbox.vc-actived .vc-log .vc-item .vc-item-content').innerHTML, ' formattedLog() Start');

      document.querySelector('.vc-toolbar .vc-tool.vc-tool-default:nth-of-type(1)').click(); // clear
      assert.equal(document.querySelector('.vc-logbox.vc-actived .vc-log .vc-item .vc-item-content'), null);

      document.querySelector('.weui_btn.weui_btn_default:nth-of-type(2)').click(); // normalObject
      assert.equal(document.querySelector('.vc-logbox.vc-actived .vc-log .vc-item .vc-item-content').innerHTML, ' normalObject() Start');

      document.querySelector('.vc-toolbar .vc-tool.vc-tool-default:nth-of-type(1)').click(); // clear
      assert.equal(document.querySelector('.vc-logbox.vc-actived .vc-log .vc-item .vc-item-content'), null);

      done();
    }, {
      features: {
        FetchExternalResources: ["link", "script"]
      }
    });
  });

  it('plugin.html', function(done) {
    jsdom.env('test/plugin.html', function(err, window) {
      var document = window.document;
      assert.equal(document.querySelector('#__vconsole') !== null, true);

      document.querySelector('.page a:nth-of-type(1)').click(); // newTab
      assert.equal(document.querySelector('.vc-tabbar .vc-tab:nth-of-type(4)').innerHTML, 'Tab1');

      done();
    }, {
      features: {
        FetchExternalResources: ["link", "script"]
      }
    });
  });

  it('ajax.html', function(done) {
    this.timeout(2000);

    jsdom.env('test/ajax.html', function(err, window) {
      var document = window.document;
      assert.equal(document.querySelector('#__vconsole') !== null, true);

      document.querySelector('.page a:nth-of-type(1)').click(); // asyncAjax
      setTimeout(function () {
        assert.equal(document.querySelector('.vc-logbox.vc-actived .vc-log .vc-fold-outer').innerHTML, 'Object {ret: 0, msg: "ok"}');
        done();
      }, 10)

    }, {
      features: {
        FetchExternalResources: ["link", "script"]
      }
    });
  });

});