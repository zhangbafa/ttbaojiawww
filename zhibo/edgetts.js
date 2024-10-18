
async function getVoices() {
  const resp = await fetch(voiceListUrl);
  return await resp.json();
}

function uuid() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

console.log(uuid())

function tts(text, options = {}) {
  const { voice = "en-GB-SoniaNeural", volume = "+0%", rate = "+0%", pitch = "+0Hz" } = options;
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`${webSocketURL}&ConnectionId=${uuid()}`);
    const audioData = [];
    ws.onmessage = (event) => {
      const rawData = event.data;
      if (typeof rawData === "string") {
        const data2 = rawData;
        if (data2.includes("turn.end")) {
          resolve(Buffer.concat(audioData));
          ws.close();
        }
        return;
      }
      const data = new Uint8Array(rawData);
      const separator = "Path:audio\r\n";
      const content = data.subarray(data.indexOf(separator) + separator.length);
      audioData.push(content);
    };
    ws.onerror = reject;
    const speechConfig = JSON.stringify({ context: { synthesis: { audio: {
      metadataoptions: { sentenceBoundaryEnabled: false, wordBoundaryEnabled: false },
      outputFormat: "audio-24khz-48kbitrate-mono-mp3"
    } } } });
    const configMessage = `X-Timestamp:${new Date().toISOString()}\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n${speechConfig}`;
    ws.onopen = () => ws.send(configMessage, (configError) => {
      if (configError)
        reject(configError);
      const ssmlMessage = `X-RequestId:${uuid()}\r\nContent-Type:application/ssml+xml\r\n` + `X-Timestamp:${new Date().toISOString()}Z\r\nPath:ssml\r\n\r\n` + `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>` + `<voice name='${voice}'><prosody pitch='${pitch}' rate='${rate}' volume='${volume}'>` + `${text}</prosody></voice></speak>`;
      ws.send(ssmlMessage, (ssmlError) => {
        if (ssmlError)
          reject(ssmlError);
      });
    });
  });
}

async function ttsSave(text, file, options = {}) {
  const audioBuffer = await tts(text, options);
  const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = file;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

var baseUrl = `speech.platform.bing.com/consumer/speech/synthesize/readaloud`;
var token = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
var webSocketURL = `wss://${baseUrl}/edge/v1?TrustedClientToken=${token}`;
var voiceListUrl = `https://${baseUrl}/voices/list?trustedclienttoken=${token}`;
var Personalities = ["Approachable", "Authentic", "Authority", "Bright", "Caring", "Casual", "Cheerful", "Clear", "Comfort", "Confident", "Considerate", "Conversational", "Cute", "Expressive", "Friendly", "Honest", "Humorous", "Lively", "Passion", "Pleasant", "Positive", "Professional", "Rational", "Reliable", "Sincere", "Sunshine", "Warm"];
var Categories = ["Novel", "Cartoon", "Conversation", "Copilot", "Dialect", "General", "News", "Novel", "Sports"];

export {
  ttsSave,
  tts,
  getVoices,
  Personalities,
  Categories
};