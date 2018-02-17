// See https://github.com/samdutton/simpl/blob/gh-pages/eme/clearkey/js/main.js
const mediaElement = document.querySelector("#myVideo");

const config = [{
  initDataTypes: ["webm"],
  videoCapabilities: [{ contentType: 'video/webm; codecs="vp8"' }]
}];

mediaElement.addEventListener("encrypted", handleEncrypted);
mediaElement.addEventListener("waitingforkey", handleWaitingForKey);

navigator.requestMediaKeySystemAccess("org.w3.clearkey", config).then((mediaKeySystemAccess) => {
  return mediaKeySystemAccess.createMediaKeys();
}).then((mediaKeys) => {
  return mediaElement.setMediaKeys(mediaKeys);
}).catch((error) => {
  console.error(error);
});

function handleEncrypted(event) {
  console.log("encrypted event", event);

  var mediaElement = event.target;
  var mediaKeySession = mediaElement.mediaKeys.createSession();

  mediaKeySession.addEventListener("message", handleMessage);
  mediaKeySession.generateRequest(event.initDataType, event.initData).catch((error) => console.error(error));
}

function handleWaitingForKey(event) {
  console.log("waitingforkey event", event);
}

function handleMessage(event) {
  console.log("message event", event);

  var license = generateLicense(event.message);
  console.log("license", license);

  var session = event.target;
  session.update(license).catch((error) => console.error(error));
}

function generateLicense(message) {
  // This takes the place of a license server
  var request = JSON.parse(new TextDecoder().decode(message));
  var key = new Uint8Array([0xeb, 0xdd, 0x62, 0xf1, 0x68, 0x14, 0xd2, 0x7b, 0x68, 0xef, 0x12, 0x2a, 0xfc, 0xe4, 0xae, 0x3c]);
  var license = new TextEncoder().encode(JSON.stringify({ keys: [{ kty: "oct", alg: "A128KW", kid: request.kids[0], k: toBase64(key) }] }));

  return license;
}

function toBase64(value) {
  return btoa(String.fromCharCode.apply(null, value)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=*$/, "");
}

mediaElement.src = "/content/video/Chrome_44-enc_av.webm";
