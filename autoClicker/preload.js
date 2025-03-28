const { contextBridge, ipcRenderer } = require('electron');


var time_adjusted = 0;

/*contextBridge.exposeInMainWorld('purified_drinking_water', {
    //sendVideoState: (state) => ipcRenderer.send('video-state', state),
    closeSelf: () => ipcRenderer.send('close_window', "self")
});*/

window.addEventListener("DOMContentLoaded", () => {
    // 阻止所有鼠标事件冒泡

    /*const video = document.querySelector('video');

    if (video) {
        const sendState = () => {
            window.electron.sendVideoState(video.paused ? 'paused' : 'playing');
        };

        video.addEventListener('play', sendState);
        video.addEventListener('pause', sendState);

        // 初始状态
        sendState();
    }*/
});


// preload.js
window.addEventListener('DOMContentLoaded', () => {
    const current_url = window.location.href;
    if (current_url.startsWith("https://i.mooc.chaoxing.com/space")) {
        loop1(1);
    } else if (current_url.startsWith("https://mooc2-ans.chaoxing.com/mooc2-ans/mycourse/stu?courseid")) {
        loop2(1);
    } else if (current_url.startsWith("https://mooc2-ans.chaoxing.com/mooc2-ans/mycourse/studentcourse?courseid")) {
        loop3(1);
    }
    else if (current_url.startsWith("https://mooc1.chaoxing.com/mycourse/studentstudy?chapterId")) {
        loop_click(document.querySelectorAll(".catalog_points_yi")[0], 1);
        play_video();
    }

    // 隐藏WebDriver标志
    //Object.defineProperty(navigator, 'webdriver', { get: () => false });
    // 删除Electron环境变量
    //delete window.process.versions.electron;
});






async function loop1(count) {
    if (count > 1000) {
        alert(`请关闭窗口重试\nfailed to find element "${await ipcRenderer.invoke('get_courseid')}"`);
    }

    let courseid = await ipcRenderer.invoke('get_courseid');
    console.log("@@@@@@courseid:", courseid);
    let ele = search(document, `[courseid="${courseid}"] a`, 0);
    if (ele) {
        console.log("aaaaa:", ele.href);
        window.location.href = ele.href;
    }

    setTimeout(() => {
        loop1(count++);
    }, 1000);
}

function loop2(count) {
    if (count > 1000) {
        alert(`发生错误\niframe not found`);
    }
    if (document.getElementById("frame_content-zj")) {
        const source = document.getElementById("frame_content-zj").src;
        window.open(source);
    }
    setTimeout(() => {
        loop2(count++);
    }, 100);
}

function loop3(count) {
    if (count > 1000) {
        alert(`没有未完成的章节了\n或者发生错误`);
    }

    if (document.querySelectorAll(".catalog_task>div>.catalog_points_yi")[0]) {
        document.querySelectorAll(".catalog_task>div>.catalog_points_yi")[0].click();
    }

    setTimeout(() => {
        loop3(count++);
    }, 100);
}

function loop_click(element, count) {
    if (count > 1000) {
        alert(`general loop_click error`);
    }

    if (element) {
        element.click();
        return;
    }
    setTimeout(() => {
        loop_click(element, count++);
    }, 100);
}

function play_video(count) {//document.querySelector("iframe").contentDocument.querySelector("iframe").contentDocument.querySelector("video")
    if (count > 1000) {
        alert(`video not found`);
    }

    const play_btn = search(document, ".vjs-big-play-button", 0);
    const video = search(document, "video", 0);
    if (video) {
        console.log("video tag obtained");
        video.addEventListener('pause', () => {
            //play_video(1);
        });
    }
    if (play_btn) {
        setTimeout(() => {
            //play_btn.click();
            simulateNaturalClick(play_btn);
        }, 500);
    } else {
        setTimeout(() => {
            play_video(count++);
            console.log("searching for <video>@", count);
        }, 100);
    }
    if (video) {
        // 确保不超过视频总时长
        video.addEventListener('canplay', () => {
            if (time_adjusted < 3) {
                const targetTime = video.duration - 0.5; // 留0.5秒缓冲
                video.currentTime = targetTime;
                time_adjusted++;
            }
        });
    }

}

function on_paused(){
    const title = search(document,".tkTopic_title",0);
    if (title){//遇到题目
        if (title == "判断题"){
            
        }
    }else {

    }
}

function search(dom, selector, depth = 0) {
    try {
        selector = selector.toString();

        // Try to find the element in current DOM
        const element = dom.querySelector(selector);
        if (element) {
            return element;
        }

        // Check for iframes
        const iframe = dom.querySelector("iframe");
        if (iframe) {
            try {
                // Access the iframe's document (may fail due to CORS)
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                if (iframeDoc) {
                    return search(iframeDoc, selector, depth + 1);
                }
            } catch (e) {
                console.error("Failed to access iframe content:", e);
                return null;
            }
        }

        return null; // Element not found
    } catch (e) {
        console.error("Search error:", e);
        return null;
    }
}


function simulateNaturalClick(element) {
    // 1. 鼠标移动到元素上
    const mouseOverEvent = new MouseEvent('mouseover', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: element.getBoundingClientRect().left + 10,
        clientY: element.getBoundingClientRect().top + 10
    });
    element.dispatchEvent(mouseOverEvent);

    // 2. 短暂延迟模拟人类反应时间
    setTimeout(() => {
        // 3. 鼠标按下
        const mouseDownEvent = new MouseEvent('mousedown', { bubbles: true });
        element.dispatchEvent(mouseDownEvent);

        // 4. 鼠标抬起（完成点击）
        setTimeout(() => {
            const mouseUpEvent = new MouseEvent('mouseup', { bubbles: true });
            element.dispatchEvent(mouseUpEvent);

            // 5. 最终触发点击事件
            setTimeout(() => {
                const clickEvent = new MouseEvent('click', { bubbles: true });
                element.dispatchEvent(clickEvent);
            }, 50);
        }, 100);
    }, 200);
}


// 暴力拦截所有可能检测用户离开的事件
const blockAllDetection = () => {
    const events = [
        // 鼠标事件
        'mouseleave', 'mouseout', 'mouseenter', 'mousemove',
        // 窗口事件
        'blur', 'focusout', 'visibilitychange', 'freeze', 'resume',
        // 设备事件
        'devicemotion', 'deviceorientation', 'idle',
        // 特殊检测事件
        'webkitmouseforcewillbegin', 'touchstart', 'pointerleave'
    ];

    events.forEach(ev => {
        window.addEventListener(ev, e => {
            e.stopImmediatePropagation();
            e.preventDefault();
        }, true); // 捕获阶段拦截
    });

    // 重写关键检测API
    Object.defineProperty(document, 'hidden', { get: () => false });
    Object.defineProperty(document, 'visibilityState', { get: () => 'visible' });
    window.addEventListener = new Proxy(window.addEventListener, {
        apply: function (target, thisArg, args) {
            if (args[0] === 'blur' || args[0].includes('mouse')) return;
            return target.apply(thisArg, args);
        }
    });
};

blockAllDetection();


