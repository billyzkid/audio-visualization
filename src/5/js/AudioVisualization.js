function describe(obj) {
  return Object.getOwnPropertyNames(obj).reduce((acc, name) => Object.assign(acc, { [name]: Object.getOwnPropertyDescriptor(obj, name) }), {});
}

const audioDescriptors = Object.assign({}, describe(HTMLMediaElement.prototype), describe(HTMLAudioElement.prototype));
const audioProperties = Object.keys(audioDescriptors).filter((name) => typeof audioDescriptors[name].get === "function" || typeof audioDescriptors[name].set === "function").sort();
const audioMethods = Object.keys(audioDescriptors).filter((name) => typeof audioDescriptors[name].value === "function").sort();
const audioConstants = Object.keys(audioDescriptors).filter((name) => typeof audioDescriptors[name].value !== "undefined" && !audioDescriptors[name].writable).sort();
const audioEvents = [
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

const observedAttributes = [
  "autoplay",
  "controls",
  "crossorigin",
  "loop",
  "muted",
  "onpaint",
  "preload",
  "src"
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
    audioEvents.forEach((name) => audioElement[name] = audioEventHandler);

    this._audioElement = audioElement;
    this._canvasContext = canvasElement.getContext("2d");
    this._onpaint = null;

    this._animationCallback = () => {
      this._requestAnimation();
      this._dispatchPaintEvent();
    };

    const shadowRoot = this.attachShadow({ mode: "closed" });
    shadowRoot.appendChild(shadowNode);
  }

  static get observedAttributes() {
    return observedAttributes;
  }

  get autoplay() {
    console.log(`${this.id || "(unknown)"}.autoplay (get)`);

    return this.hasAttribute("autoplay");
  }

  set autoplay(value) {
    console.log(`${this.id || "(unknown)"}.autoplay (set)`, { value });

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
    console.log(`${this.id || "(unknown)"}.controls (set)`, { value });

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
    console.log(`${this.id || "(unknown)"}.crossOrigin (set)`, { value });

    this.setAttribute("crossorigin", value);
  }

  get defaultMuted() {
    console.log(`${this.id || "(unknown)"}.defaultMuted (get)`);

    return this.hasAttribute("muted");
  }

  set defaultMuted(value) {
    console.log(`${this.id || "(unknown)"}.defaultMuted (set)`, { value });

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
    console.log(`${this.id || "(unknown)"}.loop (set)`, { value });

    if (value) {
      this.setAttribute("loop", "");
    } else {
      this.removeAttribute("loop");
    }
  }

  get onpaint() {
    console.log(`${this.id || "(unknown)"}.onpaint (get)`);

    return this._onpaint;
  }

  set onpaint(value) {
    console.log(`${this.id || "(unknown)"}.onpaint (set)`, { value });

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

  get preload() {
    console.log(`${this.id || "(unknown)"}.preload (get)`);

    return this.getAttribute("preload");
  }

  set preload(value) {
    console.log(`${this.id || "(unknown)"}.preload (set)`, { value });

    this.setAttribute("preload", value);
  }

  get src() {
    console.log(`${this.id || "(unknown)"}.src (get)`);

    return this.getAttribute("src");
  }

  set src(value) {
    console.log(`${this.id || "(unknown)"}.src (set)`, { value });

    this.setAttribute("src", value);
  }

  connectedCallback() {
    console.log(`${this.id || "(unknown)"}.connectedCallback`);

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
    console.log(`${this.id || "(unknown)"}.attributeChangedCallback`, { name, oldValue, newValue });

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
    console.log(`${this.id || "(unknown)"}._requestAnimation`);

    this._animationRequestId = requestAnimationFrame(this._animationCallback);
  }

  _cancelAnimation() {
    console.log(`${this.id || "(unknown)"}._cancelAnimation`);

    cancelAnimationFrame(this._animationRequestId);
  }

  _dispatchAudioEvent(event) {
    console.log(`${this.id || "(unknown)"}._dispatchAudioEvent`, { event });

    this.dispatchEvent(new Event(event.type, event));
  }

  _dispatchPaintEvent() {
    console.log(`${this.id || "(unknown)"}._dispatchPaintEvent`);

    this.dispatchEvent(new Event("paint"));
  }
}

// Copy audio properties to AudioVisualization prototype
audioProperties.filter((name) => !AudioVisualization.prototype.hasOwnProperty(name)).forEach((name) => Object.defineProperty(AudioVisualization.prototype, name, {
  get: (typeof audioDescriptors[name].get === "function") ? function () { console.log(`${this.id || "(unknown)"}.${name} (get)`); return this._audioElement[name]; } : undefined,
  set: (typeof audioDescriptors[name].set === "function") ? function (value) { console.log(`${this.id || "(unknown)"}.${name} (set)`, { value }); this._audioElement[name] = value; } : undefined,
  enumerable: false,
  configurable: true
}));

// Copy audio methods to AudioVisualization prototype
audioMethods.filter((name) => !AudioVisualization.prototype.hasOwnProperty(name)).forEach((name) => Object.defineProperty(AudioVisualization.prototype, name, {
  value: function (...args) { console.log(`${this.id || "(unknown)"}.${name}`, { args }); return this._audioElement[name](...args); },
  writable: true,
  enumerable: false,
  configurable: true
}));

// Copy audio constants to AudioVisualization prototype
audioConstants.filter((name) => !AudioVisualization.prototype.hasOwnProperty(name)).forEach((name) => Object.defineProperty(AudioVisualization.prototype, name, {
  value: HTMLAudioElement.prototype[name],
  writable: false,
  enumerable: false,
  configurable: false
}));

// const audioVisualizationDescriptors = describe(AudioVisualization.prototype);
// const audioVisualizationDescriptorsAdded = Object.keys(audioVisualizationDescriptors).filter((name) => Object.keys(audioDescriptors).indexOf(name) === -1).reduce((acc, name) => Object.assign(acc, { [name]: audioVisualizationDescriptors[name] }), {});
// const audioVisualizationDescriptorsMissing = Object.keys(audioDescriptors).filter((name) => Object.keys(audioVisualizationDescriptors).indexOf(name) === -1).reduce((acc, name) => Object.assign(acc, { [name]: audioDescriptors[name] }), {});

// console.log("audioDescriptors", audioDescriptors);
// console.log("audioProperties", audioProperties);
// console.log("audioMethods", audioMethods);
// console.log("audioConstants", audioConstants);
// console.log("audioEvents", audioEvents);
// console.log("audioVisualizationDescriptors", audioVisualizationDescriptors);
// console.log("audioVisualizationDescriptorsAdded", audioVisualizationDescriptorsAdded);
// console.log("audioVisualizationDescriptorsMissing", audioVisualizationDescriptorsMissing);

export default AudioVisualization;
