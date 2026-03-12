import * as tool from '../lib/tool';
import { VConsoleNetworkRequestItem } from './requestItem';
import type { IOnUpdateCallback } from './helper';
import { genGetDataByUrl } from './helper';

const INITIATOR_TYPE_MAP: Partial<Record<string, VConsoleNetworkRequestItem['requestType']>> = {
  img: 'img',
  script: 'script',
  link: 'stylesheet',
  css: 'stylesheet',
  font: 'font',
};

export class ResourceProxy {
  private observer: PerformanceObserver;

  public static create(onUpdateCallback: IOnUpdateCallback) {
    return new ResourceProxy(onUpdateCallback);
  }

  constructor(onUpdateCallback: IOnUpdateCallback) {
    this.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as PerformanceResourceTiming[]) {
        const type = entry.initiatorType;
        // Skip XHR/Fetch/Beacon — already captured by their own proxies
        if (type === 'xmlhttprequest' || type === 'fetch' || type === 'beacon') {
          continue;
        }

        const item = new VConsoleNetworkRequestItem();
        const url = entry.name;
        item.url = url;
        item.name = url.replace(/[?#].*$/, '').split('/').pop() || url;
        item.getData = genGetDataByUrl(url, null);
        item.method = 'GET';
        item.requestType = INITIATOR_TYPE_MAP[type] || 'resource';
        item.readyState = 4;

        const origin = performance.timeOrigin;
        item.startTime = Math.round(origin + entry.startTime);
        item.endTime = Math.round(origin + entry.startTime + entry.duration);
        item.costTime = Math.round(entry.duration);
        const sd = tool.getDate(item.startTime);
        item.startTimeText = `${sd.year}-${sd.month}-${sd.day} ${sd.hour}:${sd.minute}:${sd.second}.${sd.millisecond}`;

        // responseStatus is Chrome 90+; fall back to 200 if body exists, else 0 (cross-origin restricted)
        const status = (entry as any).responseStatus;
        item.status = status !== undefined ? status : (entry.encodedBodySize > 0 ? 200 : 0);
        item.statusText = String(item.status);

        item.responseSize = entry.encodedBodySize || entry.transferSize || 0;
        item.responseSizeText = item.responseSize ? tool.getBytesText(item.responseSize) : '';

        // transferSize === 0 means served from cache (disk/memory)
        item.transferSize = entry.transferSize;

        onUpdateCallback(item);
      }
    });

    try {
      this.observer.observe({ type: 'resource', buffered: true });
    } catch (e) {
      // Older browsers don't support the `type` option; fall back to entryTypes
      this.observer.observe({ entryTypes: ['resource'] });
    }
  }

  public unMock() {
    this.observer.disconnect();
  }
}
