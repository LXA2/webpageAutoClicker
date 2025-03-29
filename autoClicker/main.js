const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const WindowManager = require('./WindowManager');
const path = require('path');
const { protocol } = require('electron');
const storage = require('./storage');

var logged_in = false;
var courseid = "";
if (storage.getValueByKey("courseid")){
    courseid = storage.getValueByKey("courseid");
}

/*app.whenReady().then(() => {
    protocol.handle('*', (request) => {
        const url = new URL(request.url);
        console.log(url.protocol);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            console.log(`none http/https request blocked: ${request.url}`);
            return new Response('', { status: 200, headers: { 'Content-Type': 'text/plain' } });
        }
    });
});*/

app.whenReady().then(() => {
    protocol.handle('jsbridge', (request) => {
        console.log('request with scheme jsbridge blocked:', request.url);
        return new Response('', { data: '', mimeType: 'text/plain' });
    });
});


app.whenReady().then(() => {
    const mainWindowOptions = {
        width: 720,
        height: 450,
        fullscreen: false,
        frame: false,
        resizable: true,
        //transparent: true,
        webPreferences: {
            contextIsolation: true,
            preload: path.resolve(__dirname, "./main_window/preload_for_main.js")
        }
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
        } else if (window_id == "main") {
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

    ipcMain.on('login', (event) => {
        const login_window_config = {
            width: 1280,
            height: 720,
            fullscreen: false,
            frame: true,
            resizable: true,
            //transparent: true,
            webPreferences: {
                contextIsolation: true,
                preload: path.resolve(__dirname, "./preload.js")
            },
        };
        let login_window = WindowManager.createWindow(login_window_config, "login");
        login_window.loadURL("https://i.mooc.chaoxing.com");
        login_window.on('close', (event) => {
            if (!logged_in) {
                showAlert("没有登录成功,请重新登录");
            }
        });
        login_window.webContents.on('did-navigate', (event, url) => {
            checkUrlAndTriggerAction(url)
        });
        login_window.webContents.on('did-redirect-navigation', (event, url) => {
            checkUrlAndTriggerAction(url)
        });
    });

    ipcMain.on('edit_course_id', (event, cid) => {
        courseid = cid;
        storage.setKeyValue('courseid', courseid);
        console.log("courseid:",courseid);
    });

    ipcMain.on('start', (event, title) => {
        const working_progress_window_config = {
            width: 1000,
            height: 500,
            x: 0,
            y: 0,
            fullscreen: false,
            frame: true,
            focusable: true,
            resizable: true,
            //transparent: true,
            webPreferences: {
                webSecurity: true,  // 禁用Web安全策略（慎用）
                allowRunningInsecureContent: false,  // 允许加载不安全内容
                contextIsolation: true,
                preload: path.resolve(__dirname, "./preload.js")
            },
        };
        let working_progress_window = WindowManager.createWindow(working_progress_window_config, "login");
        working_progress_window.loadURL("https://i.mooc.chaoxing.com/space/");
        //working_progress_window.loadURL("https://www.electronjs.org");
        working_progress_window.blur();
        working_progress_window.webContents.setAudioMuted(true);
    });

    WindowManager.windows["main"].on('close', (event) => {
        event.preventDefault();
        showQuitConfirmation();
    });

    ipcMain.handle('get_courseid', () => {
        return courseid;
      });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});


function checkUrlAndTriggerAction(url) {
    let login_window = WindowManager.windows["login"];
    const targetPattern = 'https://i.mooc.chaoxing.com/space/'

    if (url.startsWith(targetPattern)) {
        logged_in = true;
        login_window.close();
        showAlert("登录成功");
    }
}

function showQuitConfirmation() {
    // 你可以使用 Electron 的原生对话框
    const choice = dialog.showMessageBoxSync(WindowManager.windows["main"], {
        type: 'question',
        buttons: ['确认', '取消'],
        title: '确认',
        message: '确定要退出吗？',
        defaultId: 1, // 默认选中取消按钮
        cancelId: 1   // 按ESC或点击窗口外时相当于取消
    })

    if (choice === 0) { // 用户点击了"确认退出"
        app.exit() // 强制退出，不触发 before-quit 事件
    } else {
        // 用户取消，不做任何操作，应用继续运行
    }
}


/*
 * 显示只有确定按钮的提示框
 * @param {string} message - 要显示的提示内容
 * @param {BrowserWindow} [window] - 可选，关联的窗口（使对话框模态化）
 */
function showAlert(message, window = null) {
    const options = {
        type: 'info',
        buttons: ['确定'], // 只设置一个按钮
        title: '哈哈',
        message: message,
        noLink: true // 防止将文本中的下划线解析为快捷键（Windows）
    }

    // 同步显示对话框（阻塞直到用户点击）
    if (window) {
        dialog.showMessageBoxSync(window, options);
    } else {
        dialog.showMessageBoxSync(options);
    }
}
