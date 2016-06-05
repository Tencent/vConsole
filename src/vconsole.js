/**
 * A Front-End Console Panel for Mobile Webpage
 *
 * @author WechatFE
 */

// classes
import VConsole from './core/core.js';
import VConsolePlugin from './lib/plugin.js';
// default tabs
import defaultTab from './log/default.js';
import systemTab from './log/system.js';
import networkTab from './network/network.js';

// here we go
const vConsole = new VConsole();
vConsole.addPlugin(defaultTab);
vConsole.addPlugin(systemTab);
vConsole.addPlugin(networkTab);

// export
vConsole.VConsolePlugin = VConsolePlugin;
export default vConsole;