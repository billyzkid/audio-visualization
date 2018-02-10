const audioConstants = [
  "HAVE_CURRENT_DATA",
  "HAVE_ENOUGH_DATA",
  "HAVE_FUTURE_DATA",
  "HAVE_METADATA",
  "HAVE_NOTHING",
  "NETWORK_EMPTY",
  "NETWORK_IDLE",
  "NETWORK_LOADING",
  "NETWORK_NO_SOURCE"
]

const audioMethods = [
  "addTextTrack",
  "canPlayType",
  "captureStream",
  "load",
  "pause",
  "play",
  "setMediaKeys",
  "setSinkId"
];

const audioProperties = {
  "autoplay": { readOnly: false },
  "buffered": { readOnly: true },
  "controls": { readOnly: false },
  "controlsList": { readOnly: false },
  "crossOrigin": { readOnly: false },
  "currentSrc": { readOnly: true },
  "currentTime": { readOnly: false },
  "defaultMuted": { readOnly: false },
  "defaultPlaybackRate": { readOnly: false },
  "disableRemotePlayback": { readOnly: false },
  "duration": { readOnly: true },
  "ended": { readOnly: true },
  "error": { readOnly: true },
  "loop": { readOnly: false },
  "mediaKeys": { readOnly: true },
  "muted": { readOnly: false },
  "networkState": { readOnly: true },
  "onencrypted": { readOnly: false },
  "onwaitingforkey": { readOnly: false },
  "paused": { readOnly: true },
  "playbackRate": { readOnly: false },
  "played": { readOnly: true },
  "preload": { readOnly: false },
  "readyState": { readOnly: true },
  "remote": { readOnly: true },
  "seekable": { readOnly: true },
  "seeking": { readOnly: true },
  "sinkId": { readOnly: true },
  "src": { readOnly: false },
  "srcObject": { readOnly: false },
  "textTracks": { readOnly: true },
  "volume": { readOnly: false },
  "webkitAudioDecodedByteCount": { readOnly: true },
  "webkitVideoDecodedByteCount": { readOnly: true }
};

const audioAttributes = [
  "autoplay",
  "controls",
  "crossorigin",
  "loop",
  "muted",
  "preload",
  "src"
];

const audioEvents = [
  "abort",
  "canplay",
  "canplaythrough",
  "cuechange",
  "durationchange",
  "emptied",
  "encrypted",
  "ended",
  "error",
  "loadeddata",
  "loadedmetadata",
  "loadstart",
  "pause",
  "play",
  "playing",
  "progress",
  "ratechange",
  "seeked",
  "seeking",
  "stalled",
  "suspend",
  "timeupdate",
  "volumechange",
  "waiting",
  "waitingforkey"
];

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

// Copy constants to prototype
audioConstants.forEach((name) => {
  const value = HTMLAudioElement.prototype[name];
  Object.defineProperty(AudioVisualization.prototype, name, { value, writable: false, enumerable: true, configurable: false });
});

// Copy methods to prototype
audioMethods.forEach((name) => {
  const value = function (...args) { console.log(`${this.id || "(unknown)"}.${name}`, args); return this.audioElement[name](...args); };
  Object.defineProperty(AudioVisualization.prototype, name, { value, writable: true, enumerable: false, configurable: true });
});

// Copy properties to prototype
Object.keys(audioProperties).forEach((name) => {
  const get = function () { console.log(`${this.id || "(unknown)"}.${name} (get)`); return this.audioElement[name]; };
  const set = (!audioProperties[name].readOnly) ? function (value) { console.log(`${this.id || "(unknown)"}.${name} (set)`, value); this.audioElement[name] = value; } : undefined;
  Object.defineProperty(AudioVisualization.prototype, name, { get, set, enumerable: false, configurable: true });
});


function getDescriptors(...args) {
  return args.reduce((obj1, arg) => Object.assign(obj1, Object.getOwnPropertyNames(arg).reduce((obj2, name) => Object.assign(obj2, { [name]: Object.getOwnPropertyDescriptor(arg, name) }), {})), {});
}

const audioDescriptors = getDescriptors(HTMLMediaElement.prototype, HTMLAudioElement.prototype);
const audioDescriptorKeys = Object.keys(audioDescriptors);
const audioVisualizationDescriptors = getDescriptors(AudioVisualization.prototype);
const audioVisualizationKeys = Object.keys(audioVisualizationDescriptors);
const missingKeys = audioDescriptorKeys.filter((key) => audioVisualizationKeys.indexOf(key) === -1).sort();
const missingDescriptors = missingKeys.map((key) => ({ [key]: audioDescriptors[key] })).reduce((obj, descriptor) => Object.assign(obj, descriptor), {});

console.log("audio descriptors", audioDescriptors);
console.log("audio visualization descriptors", audioVisualizationDescriptors);
console.log("missing descriptors", missingDescriptors);

export default AudioVisualization;
