import { VConsoleLogPlugin } from './log';

export class VConsoleSystemPlugin extends VConsoleLogPlugin {

  public onReady() {
    super.onReady();
    this.printSystemInfo();
  }

  public printSystemInfo() {
  	// print system info
    const ua = navigator.userAgent;
    let logMsg: string[] = [];
    
    // wechat client version
    const wxVersionMatch = ua.match(/MicroMessenger\/([\d\.]+)/i);
    const wxVersion = wxVersionMatch && wxVersionMatch[1] ? wxVersionMatch[1] : null;
    const isMiniprogram = location.host === 'servicewechat.com';

    // location
    if (!isMiniprogram) {
      console.info('[system]', 'Location:', location.href);
    }

    // device & system
    const ipod = ua.match(/(ipod).*\s([\d_]+)/i),
      ipad = ua.match(/(ipad).*\s([\d_]+)/i),
      iphone = ua.match(/(iphone)\sos\s([\d_]+)/i),
      android = ua.match(/(android)\s([\d\.]+)/i),
      mac = ua.match(/(Mac OS X)\s([\d_]+)/i);
    
    logMsg = [];
    if (android) {
      logMsg.push('Android ' + android[2]);
    } else if (iphone) {
      logMsg.push('iPhone, iOS ' + iphone[2].replace(/_/g,'.'));
    } else if (ipad) {
      logMsg.push('iPad, iOS ' + ipad[2].replace(/_/g, '.'));
    } else if (ipod) {
      logMsg.push('iPod, iOS ' + ipod[2].replace(/_/g, '.'));
    } else if (mac) {
      logMsg.push('Mac, MacOS ' + mac[2].replace(/_/g, '.'));
    }
    if (wxVersion) {
      logMsg.push('WeChat ' + wxVersion);
    }
    console.info('[system]', 'Client:', logMsg.length ? logMsg.join(', ') : 'Unknown');

    // network type
    let network = ua.toLowerCase().match(/ nettype\/([^ ]+)/g);
    if (network && network[0]) {
      network = network[0].split('/');
      logMsg = [network[1]];
      console.info('[system]', 'Network:', logMsg.length ? logMsg.join(', ') : 'Unknown');
    }

    // User Agent
    console.info('[system]', 'UA:', ua);
    

    // performance related
    // use `setTimeout` to make sure all timing points are available
    setTimeout(function() {
      const performance = window.performance || (<any>window).msPerformance || (<any>window).webkitPerformance;

      // timing
      if (performance && performance.timing) {
        const t = performance.timing;
        if (t.navigationStart) {
          console.info('[system]', 'navigationStart:', t.navigationStart);
        }
        if (t.navigationStart && t.domainLookupStart) {
          console.info('[system]', 'navigation:', (t.domainLookupStart - t.navigationStart)+'ms');
        }
        if (t.domainLookupEnd && t.domainLookupStart) {
          console.info('[system]', 'dns:', (t.domainLookupEnd - t.domainLookupStart)+'ms');
        }
        if (t.connectEnd && t.connectStart) {
          if (t.connectEnd && t.secureConnectionStart) {
            console.info('[system]', 'tcp (ssl):', (t.connectEnd - t.connectStart)+'ms ('+(t.connectEnd - t.secureConnectionStart)+'ms)');
          } else {
            console.info('[system]', 'tcp:', (t.connectEnd - t.connectStart)+'ms');
          }
        }
        if (t.responseStart && t.requestStart) {
          console.info('[system]', 'request:', (t.responseStart - t.requestStart)+'ms');
        }
        if (t.responseEnd && t.responseStart) {
          console.info('[system]', 'response:', (t.responseEnd - t.responseStart)+'ms');
        }
        if (t.domComplete && t.domLoading) {
          if (t.domContentLoadedEventStart && t.domLoading) {
            console.info('[system]', 'domComplete (domLoaded):', (t.domComplete - t.domLoading)+'ms ('+(t.domContentLoadedEventStart - t.domLoading)+'ms)');
          } else {
            console.info('[system]', 'domComplete:', (t.domComplete - t.domLoading)+'ms');
          }
        }
        if (t.loadEventEnd && t.loadEventStart) {
          console.info('[system]', 'loadEvent:', (t.loadEventEnd - t.loadEventStart)+'ms');
        }
        if (t.navigationStart && t.loadEventEnd) {
          console.info('[system]', 'total (DOM):', (t.loadEventEnd - t.navigationStart)+'ms ('+(t.domComplete - t.navigationStart)+'ms)');
        }
      }
    }, 0);
  }

}

export default VConsoleSystemPlugin;
