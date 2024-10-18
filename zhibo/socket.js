var wsUrl = "ws://47.96.139.114:4200";
var ws;
var tt;
var canSpeak = true;
var allowSpeaking = true;
let isPageActive = true;
let room_id = '';
document.addEventListener('visibilitychange', function() {
  isPageActive = !document.hidden;
});
function start(id){
  // document?.querySelector('video')?.play()
  utterance.text = "感谢"
  speechSynthesis.speak(utterance);
  if(id){
    room_id= id
    createWebSocket(wsUrl);
  }else{
    alert('房间号不能为空')
    return false
  }
  playMp3("./1.mp3")
}



var lockReconnect = false;
function createWebSocket() {
  try {
    ws = new WebSocket(wsUrl);
    init();
  } catch (e) {
    console.log("catch");
    reconnect(wsUrl);
  }
}
function init() {
  ws.onclose = function () {
    console.log("链接关闭");
    // times_tt && clearInterval(times_tt)

    reconnect(wsUrl);
  };
  ws.onerror = function () {
    console.log("发生异常了");
    reconnect(wsUrl);
  };
  ws.onopen = function () {
    //心跳检测重置
    heartCheck.start();
    
    ws.send(`{"url":"https://live.douyin.com/${room_id}"}`);
    // document.querySelector('.alert').innerHTML="已连接成功，声音已打开。"
  };

  ws.onmessage = function (event) {
    //拿到任何消息都说明当前连接是正常的
    const data = JSON.parse(event.data);
    // data.memberCount;
    // console.log(data);
    if (data) {
      // console.log(data.gift)
      const message = {
        id: Date.now(),
        nickname: data?.user?.nickName || "匿名用户",
        avatar: data.user?.AvatarThumb.urlListList[0],
        // content: data.content,
        diamondCount: data?.gift?.diamondCount || 0,
        scope: Math.random() * 15 + 5,
      };

      if (data?.gift) {
        // console.log(message.nickname,data.gift)
        message.giftUri = data.gift.icon.urlListList[0];
        message.giftName = data.gift.describe;
        if(isPageActive){
          addDataAndMove(message);
        }
        if (canSpeak && allowSpeaking) {
          // && !containsEmoji(message.nickname) && !isSpecificFormat(message)
          speaking(data,message)
        }
      }
      
    }
    heartCheck.start();
  };
}
function reconnect(url) {
  if (lockReconnect) {
    return;
  }
  lockReconnect = true;
  //没连接上会一直重连，设置延迟避免请求过多
  tt && clearTimeout(tt);

  tt = setTimeout(function () {
    createWebSocket(url);
    lockReconnect = false;
  }, 4000);
}
//心跳检测
var heartCheck = {
  timeout: 3000,
  timeoutObj: null,
  serverTimeoutObj: null,
  start: function () {
    var self = this;
    this.timeoutObj && clearTimeout(this.timeoutObj);
    this.serverTimeoutObj && clearTimeout(this.serverTimeoutObj);
    this.timeoutObj = setTimeout(function () {
      //这里发送一个心跳，后端收到后，返回一个心跳消息，
      ws.send("ping");
      self.serverTimeoutObj = setTimeout(function () {
        console.log(ws);
        ws.close();
        // createWebSocket();
      }, self.timeout);
    }, this.timeout);
  },
};

function filterString(input) {
  // 正则表达式匹配汉字、英文字母和数字
  const str = input.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, "");
  // if (str.indexOf("用户") !== -1) {
  //   return str.substring(0, 6);
  // }
  return str.substring(0, 6);
}
