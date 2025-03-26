const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('purified_drinking_water', {
    //sendVideoState: (state) => ipcRenderer.send('video-state', state),
    closeSelf: () => ipcRenderer.send('close_window', "self")
});

/*window.addEventListener('DOMContentLoaded', () => {
    const video = document.querySelector('video');

    if (video) {
        const sendState = () => {
            window.electron.sendVideoState(video.paused ? 'paused' : 'playing');
        };

        video.addEventListener('play', sendState);
        video.addEventListener('pause', sendState);

        // 初始状态
        sendState();
    }
});*/

