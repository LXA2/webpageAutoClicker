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
        //loop_click(document.querySelectorAll(".catalog_points_yi")[0], 1);
        //loop_click(searchAll(document,".catalog_points_yi")[0].parentElement.querySelector("span"), 1);
        play_video();
    }

    // 隐藏WebDriver标志
    //Object.defineProperty(navigator, 'webdriver', { get: () => false });
    // 删除Electron环境变量
    //delete window.process.versions.electron;
});






async function loop1(count) {
    if (count > 500) {
        alert(`请关闭窗口重试\nfailed to find element "${await ipcRenderer.invoke('get_courseid')}"`);
    }

    let courseid = await ipcRenderer.invoke('get_courseid');
    console.log("@@@@@@courseid:", courseid);
    let ele = search(document, `[courseid="${courseid}"] a`);
    if (ele) {
        console.log("aaaaa:", ele.href);
        window.location.href = ele.href;
    }

    setTimeout(() => {
        loop1(count++);
    }, 500);
}

function loop2(count) {
    if (count > 500) {
        alert(`发生错误\niframe not found`);
    }
    if (document.getElementById("frame_content-zj")) {
        const source = document.getElementById("frame_content-zj").src;
        window.open(source);
    }
    setTimeout(() => {
        loop2(count++);
    }, 200);
}

function loop3(count) {
    if (count > 500) {
        alert(`没有未完成的章节了\n或者发生错误`);
    }

    if (document.querySelectorAll(".catalog_task>div>.catalog_points_yi")[0]) {
        document.querySelectorAll(".catalog_task>div>.catalog_points_yi")[0].click();
    }

    setTimeout(() => {
        loop3(count++);
    }, 200);
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

    const play_btn = search(document, ".vjs-big-play-button");
    const video = search(document, "video");
    if (video) {
        //console.log("video tag obtained");
        video.addEventListener('pause', () => {
            //play_video(1);
            setTimeout(() => { on_paused() }, 1000);
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
    setInterval(() => {
        const state_flag = search(document, ".ans-job-icon.ans-job-icon-clear");
        if (state_flag) {
            const label = state_flag.getAttribute("aria-label");
            if (label == "任务点已完成") {
                console.log("任务点完成，进行下一章");
                const next_point_btn = searchAll(document, ".catalog_points_yi");
                if (next_point_btn.length > 0) {
                    console.log("找到下一章按钮", next_point_btn[0]);
                    next_point_btn[0].click();
                    loop_click(next_point_btn[0].parentElement.querySelector("span"), 1);
                    setTimeout(() => { play_video(1) }, 1000);
                    setTimeout(() => { play_video(1) }, 10000);
                } else {
                    alert("所有任务完成或发生错误");
                }
            }
        }
    }, 5000);
}

function on_paused() {
    const title = search(document, ".tkTopic_title");
    if (title) {//遇到题目
        console.log("func on_paused:遇到题目");
        if (title.innerText == "判断题") {
            console.log("func on_paused:判断题");
        } else {
            console.log("非判断题");
        }
        const options = searchAll(document, "[type = 'radio']");//两个选项
        const submit_btn = search(document, "#videoquiz-submit");//提交按钮
        console.log("func on_paused:options:", options, ", submit_btn:", submit_btn);
        if (options.length > 0 && submit_btn) {
            function loop4(count, choice) {
                if (count > 50) {
                    console.error("没等到判断题正确错误反馈");
                }
                const spanNot = search(document, "#spanNot");//回答错误文字提示
                const spanHas = search(document, "#spanHas");//回答正确
                console.log("func on_paused:spanHas:", spanHas, ", spanNot:", spanNot);
                if (spanHas && spanNot) {
                    //console.log("func on_paused:spanHas:", spanHas.style.display, ", spanNot:", spanNot.style.display);
                    if (spanHas.style.display != "block" && spanNot.style.display != "block") {
                        return setTimeout(() => { loop4(count++, choice) }, 200);
                    } else if (spanHas.style.display == "block") {
                        console.log("回答正确");
                        //回答正确
                    } else if (spanNot.style.display == "block") {
                        //回答错误
                        console.log("回答错误");
                        options[choice + 1].click();
                        console.log("choice + 1:", choice + 1);
                        setTimeout(() => { submit_btn.click() }, 10);
                        setTimeout(() => {
                            loop4(1, choice + 1);
                        }, 600);
                    }
                }
            }
            options[0].click();
            setTimeout(() => {
                submit_btn.click();
                setTimeout(() => { loop4(1, 0) }, 600);
            }, 330);
        } else {
            console.error("无法找到题目或发生错误");
        }
    } else {//播放完成或异常暂停
        const state_flag = search(document, ".ans-job-icon.ans-job-icon-clear");
        if (state_flag) {
            const label = state_flag.getAttribute("aria-label");
            if (label == "任务点未完成") {
                console.log("func on_paused:异常暂停,强制恢复播放");
                play_video(1);
            } else if (label == "任务点已完成") {
                console.log("func on_paused:播放完成");
                const unfinished_points = searchAll(document,".catalog_points_yi");
                if(unfinished_points.length > 1){
                    loop_click(unfinished_points[1], 1);
                    setTimeout(()=>{play_video()},700);
                }else{
                    alert("任务已全部完成或发生错误");
                }
            }
        }
    }
}

function search(dom, selector) {
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
                    return search(iframeDoc, selector);
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

function searchAll(dom, selector) {
    try {
        selector = selector.toString();
        let results = [];

        // 在当前DOM中查找
        const elements = dom.querySelectorAll(selector);
        if (elements.length > 0) {
            results.push(...elements);
        }

        // 检查iframe
        const iframes = dom.querySelectorAll("iframe");
        for (const iframe of iframes) {
            try {
                // 尝试访问iframe内容
                const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                if (iframeDoc) {
                    // 递归搜索iframe内容并合并结果
                    const iframeResults = searchAll(iframeDoc, selector);
                    if (iframeResults && iframeResults.length > 0) {
                        results.push(...iframeResults);
                    }
                }
            } catch (e) {
                console.error("Failed to access iframe content:", e);
                // 继续处理其他iframe而不是直接返回
            }
        }

        return results.length > 0 ? results : null;
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


