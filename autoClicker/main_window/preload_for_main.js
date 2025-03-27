const { contextBridge, ipcRenderer } = require('electron');

// contextBridge.exposeInMainWorld('purified_drinking_water', {
//     //sendVideoState: (state) => ipcRenderer.send('video-state', state),
//     closeSelf: () => ipcRenderer.send('close_window', "main"),
    
// });

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


window.addEventListener('DOMContentLoaded', () => {
    document.querySelector("#close").addEventListener("click" , () => {
        ipcRenderer.send('close_window', "main");
    });
    document.querySelector("#minimize").addEventListener("click" , () => {
        ipcRenderer.send('minimize_window', "main");
    });
    document.querySelectorAll(".btn")[0].addEventListener("click" , () => {
        ipcRenderer.send('login');
    });
    document.querySelectorAll(".btn")[1].addEventListener("click" , () => {
        ipcRenderer.send('start');
    });
    document.querySelector("#course_id").addEventListener("input" , () => {
        ipcRenderer.send("edit_course_id", document.querySelector("#course_id").value);
    });
    set_initial_value()
});

async function set_initial_value(){
    let courseid = await ipcRenderer.invoke('get_courseid');
    if (courseid){
        document.querySelector("#course_id").value = courseid;
    }
}
