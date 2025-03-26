const { BrowserWindow } = require('electron');

class WindowManager {
    constructor() {
        this.windows = {}; // 存储所有窗口
        //this.urlStack = []; // 记录 URL 访问历史
        //this.stackLock = false;
    }

    createWindow(options, id) {
        options.autoHideMenuBar = true;
        const win = new BrowserWindow(options);
        this.windows[id] = win;

        win.on('closed', () => {
            delete this.windows[id];
        });

        // 拦截新窗口打开，并在当前窗口加载新 URL
        win.webContents.setWindowOpenHandler(({ url }) => {
            //if (this.stackLock) return { action: 'deny' };

            //this.urlStack.push(win.webContents.getURL()); // 记录当前页面到历史栈
            win.loadURL(url); // 在当前窗口加载新 URL
            return { action: 'deny' }; // 阻止默认新窗口行为
        });

        return win;
    }

    /*loadContent(options, urlOrPath, id) {
        if (!this.windows[id]) return false;

        if (options === 1) {
            this.windows[id].loadFile(urlOrPath);
        } else if (options === 2) {
            this.windows[id].loadURL(urlOrPath);
        } else {
            return false;
        }
        return true;
    }*/

    closeWindow(id) {
        if (this.windows[id]) {
            this.windows[id].close();
            delete this.windows[id];
        }
    }

    getWindow(id) {
        return this.windows[id] || null;
    }
}

module.exports = new WindowManager();
