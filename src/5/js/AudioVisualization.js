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
    <audio>
      <slot></slot>
    </audio>
    <canvas></canvas>
  </div>
  <span></span>
`;

class AudioVisualization extends HTMLElement {
  constructor() {
    super();

    console.log(`${this.id || "(unknown)"}.constructor`);

    const shadowNode = template.content.cloneNode(true);
    const audioElement = shadowNode.querySelector("audio");
    const canvasElement = shadowNode.querySelector("canvas");

    const audioEventHandler = (event) => this._dispatchAudioEvent(event);
    audioEvents.forEach((name) => audioElement[`on${name}`] = audioEventHandler);

    const audioContext = new AudioContext();
    const audioSourceNode = audioContext.createMediaElementSource(audioElement);
    const audioGainNode = audioContext.createGain();
    const audioAnalyserNode = audioContext.createAnalyser();
    const audioDestinationNode = audioSourceNode.connect(audioGainNode).connect(audioAnalyserNode).connect(audioContext.destination);

    this._audioElement = audioElement;
    this._canvasContext = canvasElement.getContext("2d");
    this._animationCallback = () => { this._requestAnimation(); this.paint(); };

    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(shadowNode);
  }

  static get observedAttributes() {
    return audioAttributes;
  }

  get autoplay() {
    console.log(`${this.id || "(unknown)"}.autoplay (get)`);

    return this.hasAttribute("autoplay");
  }

  set autoplay(value) {
    console.log(`${this.id || "(unknown)"}.autoplay (set)`, [value]);

    if (value) {
      this.setAttribute("autoplay", "");
    } else {
      this.removeAttribute("autoplay");
    }
  }

  get controls() {
    console.log(`${this.id || "(unknown)"}.controls (get)`);

    return this.hasAttribute("controls");
  }

  set controls(value) {
    console.log(`${this.id || "(unknown)"}.controls (set)`, [value]);

    if (value) {
      this.setAttribute("controls", "");
    } else {
      this.removeAttribute("controls");
    }
  }

  get crossOrigin() {
    console.log(`${this.id || "(unknown)"}.crossOrigin (get)`);

    return this.getAttribute("crossorigin");
  }

  set crossOrigin(value) {
    console.log(`${this.id || "(unknown)"}.crossOrigin (set)`, [value]);

    this.setAttribute("crossorigin", value);
  }

  get defaultMuted() {
    console.log(`${this.id || "(unknown)"}.defaultMuted (get)`);

    return this.hasAttribute("muted");
  }

  set defaultMuted(value) {
    console.log(`${this.id || "(unknown)"}.defaultMuted (set)`, [value]);

    if (value) {
      this.setAttribute("muted", "");
    } else {
      this.removeAttribute("muted");
    }
  }

  get loop() {
    console.log(`${this.id || "(unknown)"}.loop (get)`);

    return this.hasAttribute("loop");
  }

  set loop(value) {
    console.log(`${this.id || "(unknown)"}.loop (set)`, [value]);

    if (value) {
      this.setAttribute("loop", "");
    } else {
      this.removeAttribute("loop");
    }
  }

  get preload() {
    console.log(`${this.id || "(unknown)"}.preload (get)`);

    return this.getAttribute("preload");
  }

  set preload(value) {
    console.log(`${this.id || "(unknown)"}.preload (set)`, [value]);

    this.setAttribute("preload", value);
  }

  get src() {
    console.log(`${this.id || "(unknown)"}.src (get)`);

    return this.getAttribute("src");
  }

  set src(value) {
    console.log(`${this.id || "(unknown)"}.src (set)`, [value]);

    this.setAttribute("src", value);
  }

  connectedCallback() {
    console.log(`${this.id || "(unknown)"}.connectedCallback`);

    //this._requestAnimation();
  }

  disconnectedCallback() {
    console.log(`${this.id || "(unknown)"}.disconnectedCallback`);

    this._cancelAnimation();
  }

  adoptedCallback() {
    console.log(`${this.id || "(unknown)"}.adoptedCallback`);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log(`${this.id || "(unknown)"}.attributeChangedCallback`, [name, oldValue, newValue]);

    if (newValue !== null) {
      this._audioElement.setAttribute(name, newValue);
    } else {
      this._audioElement.removeAttribute(name);
    }
  }

  paint() {
    console.log(`${this.id || "(unknown)"}.paint`);
  }

  _requestAnimation() {
    console.log(`${this.id || "(unknown)"}._requestAnimation`);

    this._animationRequestId = requestAnimationFrame(this._animationCallback);
  }

  _cancelAnimation() {
    console.log(`${this.id || "(unknown)"}._cancelAnimation`);

    cancelAnimationFrame(this._animationRequestId);
  }

  _dispatchAudioEvent(event) {
    console.log(`${this.id || "(unknown)"}._dispatchAudioEvent`, [event]);

    this.dispatchEvent(new Event(event.type, event));
  }
}

// Copy constants to prototype
audioConstants.forEach((name) => {
  const value = HTMLAudioElement.prototype[name];
  Object.defineProperty(AudioVisualization.prototype, name, { value, writable: false, enumerable: false, configurable: false });
});

// Copy methods to prototype
audioMethods.forEach((name) => {
  const value = function (...args) { console.log(`${this.id || "(unknown)"}.${name}`, args); return this._audioElement[name](...args); };
  Object.defineProperty(AudioVisualization.prototype, name, { value, writable: true, enumerable: false, configurable: true });
});

// Copy properties to prototype
Object.keys(audioProperties).forEach((name) => {
  const get = function () { console.log(`${this.id || "(unknown)"}.${name} (get)`); return this._audioElement[name]; };
  const set = (!audioProperties[name].readOnly) ? function (value) { console.log(`${this.id || "(unknown)"}.${name} (set)`, [value]); this._audioElement[name] = value; } : undefined;
  Object.defineProperty(AudioVisualization.prototype, name, { get, set, enumerable: false, configurable: true });
});

export default AudioVisualization;
