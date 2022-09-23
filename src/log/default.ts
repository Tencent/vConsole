import * as tool from '../lib/tool';
import { VConsoleLogPlugin } from './log';

export class VConsoleDefaultPlugin extends VConsoleLogPlugin {
  protected onErrorHandler: any;
  protected resourceErrorHandler: any;
  protected rejectionHandler: any;

  public onReady() {
    super.onReady();
    this.bindErrors();
    this.compInstance.showCmd = true;
  }

  public onRemove() {
    super.onRemove();
    this.unbindErrors();
  }

  /**
   * Catch window errors.
   */
  protected bindErrors() {
    if ( !(tool.isWindow(window) && tool.isFunction(window.addEventListener)) ) {
      return;
    }
    this.catchWindowOnError();
    this.catchResourceError();
    this.catchUnhandledRejection();
  }

  /**
   * Not catch window errors.
   */
  protected unbindErrors() {
    if ( !(tool.isWindow(window) && tool.isFunction(window.addEventListener)) ) {
      return;
    }
    window.removeEventListener('error', this.onErrorHandler);
    window.removeEventListener('error', this.resourceErrorHandler);
    window.removeEventListener('unhandledrejection', this.rejectionHandler);
  }

  /**
   * Catch `window.onerror`.
   */
  protected catchWindowOnError() {
    this.onErrorHandler = this.onErrorHandler ? this.onErrorHandler : (event) => {
      let msg = event.message;
      if (event.filename) {
        msg += '\\n\\t' + event.filename.replace(location.origin, '');
        if (event.lineno || event.colno) {
          msg += ':' + event.lineno + ':' + event.colno;
        }
      }
      // print error stack info
      const hasStack = !!event.error && !!event.error.stack;
      const stackInfo = (hasStack && event.error.stack.toString()) || '';
      msg += '\\n' + stackInfo;
      this.model.addLog({
        type: 'error',
        origData: [msg],
      }, { noOrig: true });
    };
    window.removeEventListener('error', this.onErrorHandler);
    window.addEventListener('error', this.onErrorHandler);
  }

  /**
   * Catch resource loading error: image, video, link, script.
   */
  protected catchResourceError() {
    this.resourceErrorHandler = this.resourceErrorHandler ? this.resourceErrorHandler : (event) => {
      const target = <any>event.target;
      // only catch resources error
      if (['link', 'video', 'script', 'img', 'audio'].indexOf(target.localName) > -1) {
        const src = target.href || target.src || target.currentSrc;
        this.model.addLog({
          type: 'error',
          origData: [`GET <${target.localName}> error: ${src}`],
        }, { noOrig: true });
      }
    };
    window.removeEventListener('error', this.resourceErrorHandler);
    window.addEventListener('error', this.resourceErrorHandler, true);
  }

  /**
   * Catch `Promise.reject`.
   * @reference https://developer.mozilla.org/en-US/docs/Web/API/Window/unhandledrejection_event
   */
  private catchUnhandledRejection() {
    this.rejectionHandler = this.rejectionHandler ? this.rejectionHandler : (e) => {
      let error = e && e.reason;
      const errorName = 'Uncaught (in promise) ';
      let args = [errorName, error];
      if (error instanceof Error) {
        args = [
          errorName, 
          {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
        ];
      }
      this.model.addLog({
        type: 'error',
        origData: args,
      }, { noOrig: true });
    };
    window.removeEventListener('unhandledrejection', this.rejectionHandler);
    window.addEventListener('unhandledrejection', this.rejectionHandler);
  }

}

export default VConsoleDefaultPlugin;
