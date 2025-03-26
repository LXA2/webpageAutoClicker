const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const WindowManager = require('./WindowManager');
const path = require('path');


app.whenReady().then(() => {
    const mainWindowOptions = {
        width: 1280,
        height: 720,
        fullscreen: false,
        frame: false,
        resizable: true,
        //transparent: true,
        webPreferences: {
            contextIsolation: true,
            preload: path.resolve(__dirname, "./main_window/preload_for_main.js")
        },
    };
    WindowManager.createWindow(mainWindowOptions, "main");
    WindowManager.windows["main"].loadFile("./main_window/main.html");
    WindowManager.windows["main"].setAspectRatio(16 / 9);

    ipcMain.on('set-title', (event, title) => {
        const webContents = event.sender;
        const win = BrowserWindow.fromWebContents(webContents);
        win.setTitle(title);
    });

    ipcMain.on('close_window', (event, window_id) => {
        const webContents = event.sender;
        if (window_id == "self") {
            BrowserWindow.fromWebContents(webContents).close();
        }else if(window_id == "main"){
            showQuitConfirmation();
        } else {
            WindowManager.closeWindow(window_id);
        }
    });

    ipcMain.on('minimize_window', (event, window_id) => {
        const webContents = event.sender;
        if (window_id == "self") {
            BrowserWindow.fromWebContents(webContents).minimize();
        } else {
            WindowManager.windows[window_id].minimize();
        }
    });

    ipcMain.on('login', (event, title) => {
        const login_window_config = {
            width: 1280,
            height: 720,
            fullscreen: false,
            frame: false,
            resizable: true,
            //transparent: true,
            webPreferences: {
                contextIsolation: true,
                preload: path.resolve(__dirname, "./preload.js")
            },
        };
        let login_window = WindowManager.createWindow(login_window_config,2);
        login_window.loadURL("https://i.mooc.chaoxing.com");
    });

    ipcMain.on('start', (event, title) => {

    });

    /*app.on('before-quit', (event) => {
        // 阻止默认的退出行为
        event.preventDefault();
        
        // 显示自定义确认对话框
        showQuitConfirmation();
    });*/

    WindowManager.windows["main"].on('close', (event) => {
        event.preventDefault();
        showQuitConfirmation();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

function showQuitConfirmation() {
    // 你可以使用 Electron 的原生对话框
    const choice = dialog.showMessageBoxSync(WindowManager.windows["main"], {
      type: 'question',
      buttons: ['确认', '取消'],
      title: '确认',
      message: '确定要退出应用吗？',
      defaultId: 1, // 默认选中取消按钮
      cancelId: 1   // 按ESC或点击窗口外时相当于取消
    })
    
    if (choice === 0) { // 用户点击了"确认退出"
      app.exit() // 强制退出，不触发 before-quit 事件
    } else {
      // 用户取消，不做任何操作，应用继续运行
    }
}