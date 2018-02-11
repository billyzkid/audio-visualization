import PaintEvent from "./PaintEvent.js";

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

const audioPropertiesWritable = [
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
  "onencrypted",
  "onwaitingforkey",
  "playbackRate",
  "preload",
  "src",
  "srcObject",
  "volume"
];

const audioPropertiesReadonly = [
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

    :host([hidden]) {
      display: none
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

    const audioContext = new AudioContext();
    const audioSourceNode = audioContext.createMediaElementSource(audioElement);
    const audioGainNode = audioContext.createGain();
    const audioAnalyserNode = audioContext.createAnalyser();
    const audioDestinationNode = audioSourceNode.connect(audioGainNode).connect(audioAnalyserNode).connect(audioContext.destination);

    const audioEventHandler = (event) => this._dispatchAudioEvent(event);
    audioEvents.forEach((name) => audioElement[`on${name}`] = audioEventHandler);

    this._onpaint = null;
    this._audioElement = audioElement;
    this._canvasContext = canvasElement.getContext("2d");

    this._animationCallback = () => {
      this._requestAnimation();
      this._dispatchPaintEvent();
    };

    const shadowRoot = this.attachShadow({ mode: "closed" });
    shadowRoot.appendChild(shadowNode);
  }

  static get observedAttributes() {
    return ["onpaint"].concat(audioAttributes);
  }

  get onpaint() {
    console.log(`${this.id || "(unknown)"}.onpaint (get)`);

    return this._onpaint;
  }

  set onpaint(value) {
    console.log(`${this.id || "(unknown)"}.onpaint (set)`, [value]);

    const oldValue = this._onpaint;
    const newValue = (typeof value === "function") ? value : null;

    if (oldValue) {
      this.removeEventListener("paint", oldValue);
    }

    if (newValue) {
      this.addEventListener("paint", newValue);
    }

    this._onpaint = newValue;
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
    //console.log(`${this.id || "(unknown)"}.connectedCallback`);

    this._requestAnimation();
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

    if (name === "onpaint") {
      let callback;
      if (newValue !== null) {
        try {
          callback = new Function("event", newValue);
        } catch (error) {
          console.error(error);
        }
      }
      this.onpaint = callback;
    } else if (newValue !== null) {
      this._audioElement.setAttribute(name, newValue);
    } else {
      this._audioElement.removeAttribute(name);
    }
  }

  _requestAnimation() {
    //console.log(`${this.id || "(unknown)"}._requestAnimation`);

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

  _dispatchPaintEvent() {
    //console.log(`${this.id || "(unknown)"}._dispatchPaintEvent`);

    this.dispatchEvent(new PaintEvent());
  }
}

// Copy audio constants to AudioVisualization prototype
audioConstants.filter((name) => !AudioVisualization.prototype.hasOwnProperty(name)).forEach((name) => {
  const value = HTMLAudioElement.prototype[name];
  Object.defineProperty(AudioVisualization.prototype, name, { value, writable: false, enumerable: false, configurable: false });
});

// Copy audio methods to AudioVisualization prototype
audioMethods.filter((name) => !AudioVisualization.prototype.hasOwnProperty(name)).forEach((name) => {
  const value = function (...args) { console.log(`${this.id || "(unknown)"}.${name}`, args); return this._audioElement[name](...args); };
  Object.defineProperty(AudioVisualization.prototype, name, { value, writable: true, enumerable: false, configurable: true });
});

// Copy writable audio properties to AudioVisualization prototype
audioPropertiesWritable.filter((name) => !AudioVisualization.prototype.hasOwnProperty(name)).forEach((name) => {
  const get = function () { console.log(`${this.id || "(unknown)"}.${name} (get)`); return this._audioElement[name]; };
  const set = function (value) { console.log(`${this.id || "(unknown)"}.${name} (set)`, [value]); this._audioElement[name] = value; };
  Object.defineProperty(AudioVisualization.prototype, name, { get, set, enumerable: false, configurable: true });
});

// Copy readonly audio properties to AudioVisualization prototype
audioPropertiesReadonly.filter((name) => !AudioVisualization.prototype.hasOwnProperty(name)).forEach((name) => {
  const get = function () { console.log(`${this.id || "(unknown)"}.${name} (get)`); return this._audioElement[name]; };
  Object.defineProperty(AudioVisualization.prototype, name, { get, enumerable: false, configurable: true });
});

//defineEventAttributes(AudioVisualization, ["paint"]);

// function defineEventAttributes(Class, eventTypes) {
//   let onEventTypes = eventTypes.map(type => 'on' + type);
//   eventTypes.forEach(type => {
//     const symbol = Symbol();
//     Object.defineProperty(Class.prototype, 'on' + type, {
//       get: function () {
//         return this[symbol] || null;
//       },
//       set: function (callback) {
//         this[symbol] && this.removeEventListener(type, this[symbol]);
//         this[symbol] = typeof callback == 'function' ? callback : null;
//         this[symbol] && this.addEventListener(type, this[symbol]);
//       },
//       enumerable: false,
//     });
//   });

//   let superObservedAttributes = Class.observedAttributes;
//   if ('observedAttributes' in Class) {
//     // If the element definition filters the set of observed attributes so that it only reports
//     // on a specific subset of them, we’ll obviously need to add our on* attributes.
//     Object.defineProperty(Class, 'observedAttributes', {
//       value: superObservedAttributes.concat(onEventTypes),
//     });
//   }

//   let superACC = Class.prototype.attributeChangedCallback;
//   Object.defineProperty(Class.prototype, 'attributeChangedCallback', {
//     value: function attributeChangedCallback(name, oldValue, newValue) {
//       if (onEventTypes.indexOf(name) != -1) {
//         // It's one of our events, so we handle it.
//         let callback;
//         if (newValue != null) {
//           try {
//             callback = Function('event', newValue);
//           } catch (e) {
//             // Browsers tend to show an error in the console, but it's not
//             // thrown from this context; the property access returns null.
//             // I wonder, would setTimeout(function() { throw e; }, 0) be better?
//             window.console && console.error && console.error(e);
//           }
//         }
//         this[name] = callback;
//       }
//       if (!superObservedAttributes || superObservedAttributes.indexOf(name)) {
//         // The real attributeChangedCallback wants this attribute.
//         // (Note that it may be one of our events too; that’s OK.)
//         superACC && superACC.apply(this, arguments);
//       }
//     },
//     enumerable: false,
//   });

//   // Custom Events V1 has attributeChangedCallback being called for all suitable attributes on
//   // upgrade, so we don’t need to do anything for it. Custom Elements V0 (which is what polyfills
//   // like webcomponents.js polyfill at the time of writing) doesn’t, so it needs createdCallback
//   // to be set to hook up the events initially. (V1 uses constructor instead of createdCallback,
//   // so this change should be harmless.)
//   let superCC = Class.prototype.createdCallback;
//   Object.defineProperty(Class.prototype, 'createdCallback', {
//     value: function createdCallback() {
//       superCC && superCC.apply(this, arguments);
//       for (let type of eventTypes) {
//         let name = 'on' + type,
//           value = this.getAttribute(name);
//         if (value != null) {
//           this.attributeChangedCallback(name, null, value);
//         }
//       }
//     },
//     enumerable: false,
//   });
// }

export default AudioVisualization;
