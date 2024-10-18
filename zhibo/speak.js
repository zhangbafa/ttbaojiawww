const synth = window.speechSynthesis;
const utterance = new SpeechSynthesisUtterance();
const speakingList = [];
utterance.lang = 'zh-CN'
utterance.volume = 1;
utterance.rate = 1;
utterance.pitch = 1;
const voices = speechSynthesis.getVoices();
if (navigator.userAgent.includes("Edg")) {
  utterance.voice = voices[49];
  console.log("Edge");
} else {
  utterance.voice = voices[64];
}

function speaking(data, message) {
  if (!synth.speaking) {
    if (speakingList.length > 20) {
      speakingList.shift();
    }
    // 取数组的最后一个元素，最后一个不是当前的就可以播报
    const lastElement = speakingList.at(-1);
    // 取最后 5 个元素，当前的不在这五个中就可以播报
    // const lastElement = array.slice(-n)
    // data.gift.diamondCount>1 优先播报
    if (lastElement != data.user.id) {
      // 可以播报
      const nickname = filterString(message.nickname);
      utterance.text = "感谢" + nickname + message.giftName;
      // console.log(utterance.text)
      speechSynthesis.speak(utterance);
      speakingList.push(data.user.id);
    }

    utterance.onend = (event) => {
      // console.log('朗读结束');
    };
    utterance.onstart = (event) => {
      // console.log('朗读开始');
    };
  }
}

// else if (data?.memberCount && data.memberCount>10){
//   // 使用真实数据
//   utterance.text = '欢迎'+message.nickname+'进入直播间'
// }else{
//   const randomIndex = Math.floor(Math.random() * randomChineseNicknames.length);
//   utterance.text = '欢迎'+randomChineseNicknames[randomIndex]+'进入直播间'
// }

function playMp3(filename) {
  const audioContext = new AudioContext();
  // 使用 fetch API 加载音频文件
  fetch(filename)
    .then((response) => response.arrayBuffer())
    .then((data) => audioContext.decodeAudioData(data))
    .then((decodedData) => {
      // 创建一个音频源节点
      const audioBufferSource = audioContext.createBufferSource();
      audioBufferSource.buffer = decodedData;

      // 连接到输出设备
      audioBufferSource.connect(audioContext.destination);
      audioBufferSource.loop = true
      // 播放音频
      audioBufferSource.start();
    })
    .catch((error) => console.error("Error loading audio file:", error));
}
