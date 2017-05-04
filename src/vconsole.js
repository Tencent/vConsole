/**
 * A Front-End Console Panel for Mobile Webpage
 *
 * @author WechatFE
 */

// classes
import VConsole from './core/core.js';
import VConsolePlugin from './lib/plugin.js';
// built-in tabs
import VConsoleDefaultTab from './log/default.js';
import VConsoleNetworkTab from './network/network.js';

import printSystemInfo from './log/system.js';

// here we go
const vConsole = new VConsole();

const defaultTab = new VConsoleDefaultTab('default', 'Log');
vConsole.addPlugin(defaultTab);

// const systemTab = new VConsoleSystemTab('system', 'System');
// vConsole.addPlugin(systemTab);

printSystemInfo()

const networkTab = new VConsoleNetworkTab('network', 'Network');
vConsole.addPlugin(networkTab);


// export
vConsole.VConsolePlugin = VConsolePlugin;
export default vConsole;