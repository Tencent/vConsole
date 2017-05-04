/**
 * vConsole System Tab
 *
 * @author WechatFE
 */

function printSystemInfo() {
	// print system info
  let ua = navigator.userAgent,
    logMsg = '';

  // device & system
  let ipod = ua.match(/(ipod).*\s([\d_]+)/i),
    ipad = ua.match(/(ipad).*\s([\d_]+)/i),
    iphone = ua.match(/(iphone)\sos\s([\d_]+)/i),
    android = ua.match(/(android)\s([\d\.]+)/i);

  logMsg = 'Unknown';
  if (android) {
    logMsg = 'Android ' + android[2];
  } else if (iphone) {
    logMsg = 'iPhone, iOS ' + iphone[2].replace(/_/g,'.');
  } else if (ipad) {
    logMsg = 'iPad, iOS ' + ipad[2].replace(/_/g, '.');
  } else if (ipod) {
    logMsg = 'iPod, iOS ' + ipod[2].replace(/_/g, '.');
  }
  let templogMsg = logMsg;
  // wechat client version
  let version = ua.match(/MicroMessenger\/([\d\.]+)/i);
  logMsg = 'Unknown';
  if (version && version[1]) {
    logMsg = version[1];
    templogMsg += (', WeChat ' + logMsg);
    console.info('[System]', 'System:', templogMsg);
  } else {
    console.info('[System]', 'System:', templogMsg);
  }

  // HTTP protocol
  logMsg = 'Unknown';
  if (location.protocol == 'https:') {
    logMsg = 'HTTPS';
  } else if (location.protocol == 'http:') {
    logMsg = 'HTTP';
  } else {
    logMsg = location.protocol.replace(':', '');
  }
  templogMsg = logMsg;
  // network type
  let network = ua.toLowerCase().match(/ nettype\/([^ ]+)/g);
  logMsg = 'Unknown';
  if (network && network[0]) {
    network = network[0].split('/');
    logMsg = network[1];
    templogMsg += (', ' + logMsg);
    console.info('[System]', 'Network:', templogMsg);
  } else {
    console.info('[System]', 'Protocol:', templogMsg);
  }

  // User Agent
  console.info('[System]', 'UA:', ua);

  // performance related
  // use `setTimeout` to make sure all timing points are available
  setTimeout(function() {
    let performance = window.performance || window.msPerformance || window.webkitPerformance;

    // timing
    if (performance && performance.timing) {
      let t = performance.timing;
      if (t.navigationStart) {
        console.info('[System]', 'navigationStart:', t.navigationStart);
      }
      if (t.navigationStart && t.domainLookupStart) {
        console.info('[System]', 'navigation:', (t.domainLookupStart - t.navigationStart)+'ms');
      }
      if (t.domainLookupEnd && t.domainLookupStart) {
        console.info('[System]', 'dns:', (t.domainLookupEnd - t.domainLookupStart)+'ms');
      }
      if (t.connectEnd && t.connectStart) {
        if (t.connectEnd && t.secureConnectionStart) {
          console.info('[System]', 'tcp (ssl):', (t.connectEnd - t.connectStart)+'ms ('+(t.connectEnd - t.secureConnectionStart)+'ms)');
        } else {
          console.info('[System]', 'tcp:', (t.connectEnd - t.connectStart)+'ms');
        }
      }
      if (t.responseStart && t.requestStart) {
        console.info('[System]', 'request:', (t.responseStart - t.requestStart)+'ms');
      }
      if (t.responseEnd && t.responseStart) {
        console.info('[System]', 'response:', (t.responseEnd - t.responseStart)+'ms');
      }
      if (t.domComplete && t.domLoading) {
        if (t.domContentLoadedEventStart && t.domLoading) {
          console.info('[System]', 'domComplete (domLoaded):', (t.domComplete - t.domLoading)+'ms ('+(t.domContentLoadedEventStart - t.domLoading)+'ms)');
        } else {
          console.info('[System]', 'domComplete:', (t.domComplete - t.domLoading)+'ms');
        }
      }
      if (t.loadEventEnd && t.loadEventStart) {
        console.info('[System]', 'loadEvent:', (t.loadEventEnd - t.loadEventStart)+'ms');
      }
      if (t.navigationStart && t.loadEventEnd) {
        console.info('[System]', 'total (DOM):', (t.loadEventEnd - t.navigationStart)+'ms ('+(t.domComplete - t.navigationStart)+'ms)');
      }
    }
  }, 0);
}

export default printSystemInfo;