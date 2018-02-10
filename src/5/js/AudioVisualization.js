const template = document.createElement("template");

template.innerHTML = `
  <style>
    :host {
      display: inline-block;
      width: 300px;
      height: 150px;
    }

    div {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: center;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    span {
      display: flex;
    }

    audio {
      flex: none;
      width: 100%;
      order: 1;
    }

    canvas {
      flex: auto;
      width: 100%;
      min-height: 0;
    }
  </style>
  <div>
    <audio controls>
      <slot></slot>
    </audio>
    <canvas></canvas>
  </div>
  <span></span>
`;

class AudioVisualization extends HTMLElement {
  constructor() {
    super();

    //console.log(`${this.id || "(unknown)"}.constructor`);

    const shadowNode = template.content.cloneNode(true);

    // Initialize audio
    const audioContext = new AudioContext();
    const audioElement = this.audioElement = shadowNode.querySelector("audio");
    const audioSourceNode = audioContext.createMediaElementSource(audioElement);
    const audioGainNode = audioContext.createGain();
    const audioAnalyserNode = audioContext.createAnalyser();
    const audioDestinationNode = audioSourceNode.connect(audioGainNode).connect(audioAnalyserNode).connect(audioContext.destination);

    // Initialize canvas
    const canvasElement = shadowNode.querySelector("canvas");
    const canvasContext = canvasElement.getContext("2d");

    this._animationCallback = () => {
      this._requestAnimation();
      this.paint();
    };

    // Initialize shadow root
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(shadowNode);
  }

  _requestAnimation() {
    //console.log(`${this.id || "(unknown)"}._requestAnimation`);

    this._animationRequestId = requestAnimationFrame(this._animationCallback);
  }

  _cancelAnimation() {
    //console.log(`${this.id || "(unknown)"}._cancelAnimation`);

    cancelAnimationFrame(this._animationRequestId);
  }

  connectedCallback() {
    //console.log(`${this.id || "(unknown)"}.connectedCallback`);

    this._requestAnimation();
  }

  disconnectedCallback() {
    //console.log(`${this.id || "(unknown)"}.disconnectedCallback`);

    this._cancelAnimation();
  }

  adoptedCallback() {
    //console.log(`${this.id || "(unknown)"}.adoptedCallback`);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    //console.log(`${this.id || "(unknown)"}.attributeChangedCallback`, { name, oldValue, newValue });
  }

  paint() {
    //console.log(`${this.id || "(unknown)"}.paint`);
  }
}

// for (const name of methodNames) {
//   AudioVisualization.prototype[name] = function (...args) {
//     console.log(`${this.id || "(unknown)"}.${name}`, args);
//     return this.audioElement[name](...args);
//   };
// }

// for (const name of methodNames) {
//   const value = new Function("...args", `console.log(\`$\{this.id || "(unknown)"\}.${name}\`, args); return this.audioElement.${name}(...args);`);
//   Object.defineProperty(AudioVisualization.prototype, name, { value, writable: true, enumerable: false, configurable: true });
// }

// for (const name of methodNames) {
//   const value = function (...args) {
//     console.log(`${this.id || "(unknown)"}.${name}`, args);
//     return this.audioElement[name](...args);
//   };
//   Object.defineProperty(AudioVisualization.prototype, name, { value, writable: true, enumerable: false, configurable: true });
// }

// for (const name of methodNames) {
//   Object.defineProperty(AudioVisualization.prototype, name, {
//     writable: true,
//     enumerable: false,
//     configurable: true,
//     value: function (...args) {
//       console.log(`${this.id || "(unknown)"}.${name}`, args);
//       return this.audioElement[name](...args);
//     }
//   });
// }

// for (const name of methodNames) {
//   Object.assign(AudioVisualization.prototype, {
//     [name]: function (...args) {
//       console.log(`${this.id || "(unknown)"}.${name}`, args);
//       return this.audioElement[name](...args);
//     }
//   });
// }

function getDescriptors(...args) {
  return args.reduce((obj, arg) => Object.assign(obj, Object.getOwnPropertyNames(arg).map((name) => ({ name, descriptor: Object.getOwnPropertyDescriptor(arg, name) })).filter((obj) => obj.descriptor.enumerable).reduce((acc, obj) => Object.assign(acc, { [obj.name]: obj.descriptor }), {})), {});
}

const allDescriptors = getDescriptors(HTMLElement.prototype, HTMLMediaElement.prototype, HTMLAudioElement.prototype);
const mediaDescriptors = getDescriptors(HTMLMediaElement.prototype, HTMLAudioElement.prototype);
const eventDescriptors = Object.keys(allDescriptors).filter((key) => key.startsWith("on")).reduce((obj, key) => Object.assign(obj, { [key]: allDescriptors[key] }), {});
const methodDescriptors = Object.keys(mediaDescriptors).filter((key) => !key.startsWith("on") && typeof mediaDescriptors[key].value == "function").reduce((obj, key) => Object.assign(obj, { [key]: mediaDescriptors[key] }), {});
const writablePropertyDescriptors = Object.keys(mediaDescriptors).filter((key) => !key.startsWith("on") && typeof mediaDescriptors[key].get == "function" && typeof mediaDescriptors[key].set == "function").reduce((obj, key) => Object.assign(obj, { [key]: mediaDescriptors[key] }), {});
const readonlyPropertyDescriptors = Object.keys(mediaDescriptors).filter((key) => !key.startsWith("on") && typeof mediaDescriptors[key].get == "function" && typeof mediaDescriptors[key].set == "undefined").reduce((obj, key) => Object.assign(obj, { [key]: mediaDescriptors[key] }), {});

console.log("all descriptors", allDescriptors);
console.log("media descriptors", mediaDescriptors);
console.log("events", Object.keys(eventDescriptors).sort());
console.log("methods", Object.keys(methodDescriptors).sort());
console.log("writable properties", Object.keys(writablePropertyDescriptors).sort());
console.log("readonly properties", Object.keys(readonlyPropertyDescriptors).sort());

const events =  [
  "onabort",
  "oncanplay",
  "oncanplaythrough",
  "oncuechange",
  "ondurationchange",
  "onemptied",
  "onencrypted",
  "onended",
  "onerror",
  "onloadeddata",
  "onloadedmetadata",
  "onloadstart",
  "onpause",
  "onplay",
  "onplaying",
  "onprogress",
  "onratechange",
  "onseeked",
  "onseeking",
  "onstalled",
  "onsuspend",
  "ontimeupdate",
  "onvolumechange",
  "onwaiting",
  "onwaitingforkey"
];

const methods =  [
  "addTextTrack",
  "canPlayType",
  "captureStream",
  "load",
  "pause",
  "play",
  "setMediaKeys",
  "setSinkId"
];

const attributes =  [
  "autoplay",
  "controls",
  "crossOrigin",
  "loop",
  "muted",
  "preload",
  "src"
];

const writableProperties =  [
  "autoplay",
  "controls",
  "controlsList",
  "crossOrigin",
  "currentTime",
  "defaultMuted",
  "defaultPlaybackRate",
  "disableRemotePlayback",
  "loop",
  "muted",
  "playbackRate",
  "preload",
  "src",
  "srcObject",
  "volume"
];

const readonlyProperties =  [
  "buffered",
  "currentSrc",
  "duration",
  "ended",
  "error",
  "mediaKeys",
  "networkState",
  "paused",
  "played",
  "readyState",
  "remote",
  "seekable",
  "seeking",
  "sinkId",
  "textTracks",
  "webkitAudioDecodedByteCount",
  "webkitVideoDecodedByteCount"
];

export default AudioVisualization;
