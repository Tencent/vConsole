import VConsole from 'vconsole';

class MyPlugin extends VConsole.VConsolePlugin {

}

const vc = new VConsole();
vc.addPlugin(new MyPlugin);
