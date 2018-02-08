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
    <audio controls></audio>
    <canvas></canvas>
  </div>
  <span></span>
`;

const events = [
  "abort",
  "canplay",
  "canplaythrough",
  "durationchange",
  "emptied",
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
  "waiting"
];

const properties = [
  { name: "autoplay", readonly: false, attribute: true },
  { name: "controls", readonly: false, attribute: true },
  { name: "currentTime", readonly: false, attribute: false },
  { name: "defaultMuted", readonly: false, attribute: false },
  { name: "duration", readonly: true, attribute: false },
  { name: "ended", readonly: true, attribute: false },
  { name: "error", readonly: true, attribute: false },
  { name: "loop", readonly: false, attribute: true },
  { name: "muted", readonly: false, attribute: true },
  { name: "paused", readonly: true, attribute: false },
  { name: "preload", readonly: false, attribute: true },
  { name: "seeking", readonly: true, attribute: false },
  { name: "src", readonly: false, attribute: true },
  { name: "volume", readonly: false, attribute: false }
];

const methods = [
  "load",
  "pause",
  "play"
]

class AudioVisualization extends HTMLElement {
  constructor() {
    super();

    console.log(`${this.id || "(unknown)"}.constructor`);

    try {
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

      this.attachShadow({ mode: "closed" }).appendChild(shadowNode);
    } catch (error) {
      console.error(error);
    }
  }

  _requestAnimation() {
    console.log(`${this.id || "(unknown)"}._requestAnimation`);

    this._animationRequestId = requestAnimationFrame(this._animationCallback);
  }

  _cancelAnimation() {
    console.log(`${this.id || "(unknown)"}._cancelAnimation`);

    cancelAnimationFrame(this._animationRequestId);
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
    console.log(`${this.id || "(unknown)"}.attributeChangedCallback`, { name, oldValue, newValue });
  }

  paint() {
    console.log(`${this.id || "(unknown)"}.paint`);
  }

  // fake(x, y, z) {
  //   console.log(`${this.id || "(unknown)"}.fake`, { x, y, z });
  //   return true;
  // }
}

// for (const method of methods) {
//   AudioVisualization.prototype[method] = function (...args) {
//     console.log(`${this.id || "(unknown)"}.${method}`, args);
//     return this.audioElement[method](...args);
//   };
// }

// Object.keys(descriptors4).forEach((key) => {
//   Object.defineProperty(AudioVisualization.prototype, key, descriptors4[key]);
// });

// AudioVisualization.HAVE_NOTHING = HTMLMediaElement.HAVE_NOTHING;
// AudioVisualization.HAVE_METADATA = HTMLMediaElement.HAVE_METADATA;
// AudioVisualization.HAVE_CURRENT_DATA = HTMLMediaElement.HAVE_CURRENT_DATA;
// AudioVisualization.HAVE_FUTURE_DATA = HTMLMediaElement.HAVE_FUTURE_DATA;
// AudioVisualization.HAVE_ENOUGH_DATA = HTMLMediaElement.HAVE_ENOUGH_DATA;

// AudioVisualization.NETWORK_EMPTY = HTMLMediaElement.NETWORK_EMPTY;
// AudioVisualization.NETWORK_IDLE = HTMLMediaElement.NETWORK_IDLE;
// AudioVisualization.NETWORK_LOADING = HTMLMediaElement.NETWORK_LOADING;
// AudioVisualization.NETWORK_NO_SOURCE = HTMLMediaElement.NETWORK_NO_SOURCE;

function getDescriptors(o) {
  return Object.getOwnPropertyNames(o).reduce((obj, name) => {
    var descriptor = Object.getOwnPropertyDescriptor(o, name);
    if (descriptor.enumerable) {
      return Object.assign(obj, { [name]: descriptor });
    } else {
      return obj;
    }
  }, {});
}

document.createElement("audio").NETWORK_EMPTY

console.log(getDescriptors(HTMLAudioElement));
console.log(getDescriptors(HTMLAudioElement.prototype));
console.log(getDescriptors(HTMLMediaElement));
console.log(getDescriptors(HTMLMediaElement.prototype));
console.log(getDescriptors(AudioVisualization));
console.log(getDescriptors(AudioVisualization.prototype));

export default AudioVisualization;
