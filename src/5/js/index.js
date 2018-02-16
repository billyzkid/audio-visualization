import AudioVisualization from "./AudioVisualization.js";

customElements.define("audio-visualization", AudioVisualization);
// adoptedLink.import.querySelectorAll("audio-visualization").forEach((child) => document.body.appendChild(child));

playEncryptedMedia(myAudio, "org.w3.clearkey", [{
  initDataTypes: ["webm"],
  videoCapabilities: [{ contentType: 'video/webm; codecs="vp8"' }]
}]);

// See https://github.com/samdutton/simpl/blob/gh-pages/eme/clearkey/js/main.js
function playEncryptedMedia(mediaElement, keySystem, config) {
  mediaElement.addEventListener("encrypted", handleEncrypted, false);
  mediaElement.addEventListener("waitingforkey", handleWaitingForKey, false);

  navigator.requestMediaKeySystemAccess(keySystem, config).then((mediaKeySystemAccess) => {
    return mediaKeySystemAccess.createMediaKeys();
  }).then((mediaKeys) => {
    return mediaElement.setMediaKeys(mediaKeys);
  }).catch((error) => {
    console.error(error);
  });

  mediaElement.src="/content/video/Chrome_44-enc_av.webm";

  function handleEncrypted(event) {
    console.log("encrypted event", event);

    var mediaElement = event.target;
    var mediaKeySession = mediaElement.mediaKeys.createSession();

    mediaKeySession.addEventListener("message", handleMessage, false);
    mediaKeySession.generateRequest(event.initDataType, event.initData).catch((error) => console.error(error));
  }

  function handleWaitingForKey(event) {
    console.log("waitingforkey event", event);
  }

  function handleMessage(event) {
    console.log("message event", event);

    var license = generateLicense(event.message);
    console.log("license", license);

    var mediaKeySession = event.target;
    mediaKeySession.update(license).catch((error) => console.error(error));
  }

  function toBase64(u8arr) {
    return btoa(String.fromCharCode.apply(null, u8arr))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=*$/, "");
  }

  var KEY = new Uint8Array([
    0xeb, 0xdd, 0x62, 0xf1, 0x68, 0x14, 0xd2, 0x7b,
    0x68, 0xef, 0x12, 0x2a, 0xfc, 0xe4, 0xae, 0x3c
  ]);

  // This takes the place of a license server
  function generateLicense(message) {
    var request = JSON.parse(new TextDecoder().decode(message));
    var keyObj = { kty: "oct", alg: "A128KW", kid: request.kids[0], k: toBase64(KEY) };
    var json = JSON.stringify({ keys: [keyObj] });
    return new TextEncoder().encode(json);
  }
}
