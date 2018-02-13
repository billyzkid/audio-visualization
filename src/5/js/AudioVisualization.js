const allDescriptors = Object.assign({},
  Object.getOwnPropertyDescriptors(Element.prototype),
  Object.getOwnPropertyDescriptors(HTMLElement.prototype),
  Object.getOwnPropertyDescriptors(HTMLMediaElement.prototype),
  Object.getOwnPropertyDescriptors(HTMLAudioElement.prototype));

const audioDescriptors = Object.assign({},
  Object.getOwnPropertyDescriptors(HTMLMediaElement.prototype),
  Object.getOwnPropertyDescriptors(HTMLAudioElement.prototype));

Object.assign(audioDescriptors.autoplay, { attribute: "autoplay", boolean: true });
Object.assign(audioDescriptors.controls, { attribute: "controls", boolean: true });
Object.assign(audioDescriptors.crossOrigin, { attribute: "crossorigin", boolean: false });
Object.assign(audioDescriptors.defaultMuted, { attribute: "muted", boolean: true });
Object.assign(audioDescriptors.loop, { attribute: "loop", boolean: true });
Object.assign(audioDescriptors.preload, { attribute: "preload", boolean: false });
Object.assign(audioDescriptors.src, { attribute: "src", boolean: false });

const audioEvents = Object.keys(allDescriptors).filter((key) => /^on(abort|canplay|canplaythrough|cuechange|durationchange|emptied|encrypted|ended|error|loadeddata|loadedmetadata|loadstart|pause|play|playing|progress|ratechange|seeked|seeking|stalled|suspend|timeupdate|volumechange|waiting|waitingforkey)$/.test(key)).sort();
const audioAttributes = Object.keys(audioDescriptors).filter((key) => typeof audioDescriptors[key].get === "function" && audioDescriptors[key].hasOwnProperty("attribute")).sort();
const audioProperties = Object.keys(audioDescriptors).filter((key) => typeof audioDescriptors[key].get === "function" && !audioDescriptors[key].hasOwnProperty("attribute")).sort();
const audioMethods = Object.keys(audioDescriptors).filter((key) => key !== "constructor" && audioDescriptors[key].hasOwnProperty("value") && typeof audioDescriptors[key].value === "function").sort();
const audioConstants = Object.keys(audioDescriptors).filter((key) => audioDescriptors[key].hasOwnProperty("value") && typeof audioDescriptors[key].value !== "function").sort();

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

    //console.log(`${this.id || "(unknown)"}.constructor`);

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
    return audioAttributes.concat("onpaint");
  }

  get onpaint() {
    //console.log(`${this.id || "(unknown)"}.onpaint (get)`);

    return this._onpaint;
  }

  set onpaint(value) {
    //console.log(`${this.id || "(unknown)"}.onpaint (set)`, { value });

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

    switch (name) {
      case "onpaint":
        this.onpaint = (newValue !== null) ? new Function("event", newValue) : newValue;
        break;

      default:
        this._audioElement[name] = newValue;
        break;
    }
  }

  _requestAnimation() {
    //console.log(`${this.id || "(unknown)"}._requestAnimation`);

    this._animationRequestId = requestAnimationFrame(this._animationCallback);
  }

  _cancelAnimation() {
    //console.log(`${this.id || "(unknown)"}._cancelAnimation`);

    cancelAnimationFrame(this._animationRequestId);
  }

  _dispatchAudioEvent(event) {
    //console.log(`${this.id || "(unknown)"}._dispatchAudioEvent`, { event });

    this.dispatchEvent(new Event(event.type, event));
  }

  _dispatchPaintEvent() {
    //console.log(`${this.id || "(unknown)"}._dispatchPaintEvent`);

    this.dispatchEvent(new Event("paint"));
  }
}

// Copy audio attributes to AudioVisualization prototype
audioAttributes.forEach((name) => Object.defineProperty(AudioVisualization.prototype, name, {
  get: (audioDescriptors[name].boolean) ? function () { console.log(`${this.id || "(unknown)"}.${name} (get)`); return this.hasAttribute(audioDescriptors[name].attribute) } : function () { console.log(`${this.id || "(unknown)"}.${name} (get)`); return this.getAttribute(audioDescriptors[name].attribute) },
  set: (audioDescriptors[name].boolean) ? function (value) { console.log(`${this.id || "(unknown)"}.${name} (set)`, { value }); if (value) { this.setAttribute(audioDescriptors[name].attribute, ""); } else { this.removeAttribute(audioDescriptors[name].attribute); } } : function (value) { console.log(`${this.id || "(unknown)"}.${name} (set)`, { value }); this.setAttribute(audioDescriptors[name].attribute, value); },
  enumerable: false,
  configurable: true
}));

// Copy audio properties to AudioVisualization prototype
audioProperties.forEach((name) => Object.defineProperty(AudioVisualization.prototype, name, {
  get: (typeof audioDescriptors[name].get === "function") ? function () { console.log(`${this.id || "(unknown)"}.${name} (get)`); return this._audioElement[name]; } : undefined,
  set: (typeof audioDescriptors[name].set === "function") ? function (value) { console.log(`${this.id || "(unknown)"}.${name} (set)`, { value }); this._audioElement[name] = value; } : undefined,
  enumerable: false,
  configurable: true
}));

// Copy audio methods to AudioVisualization prototype
audioMethods.forEach((name) => Object.defineProperty(AudioVisualization.prototype, name, {
  value: function (...args) { console.log(`${this.id || "(unknown)"}.${name}`, { args }); return this._audioElement[name](...args); },
  writable: true,
  enumerable: false,
  configurable: true
}));

// Copy audio constants to AudioVisualization prototype
audioConstants.forEach((name) => Object.defineProperty(AudioVisualization.prototype, name, {
  value: HTMLAudioElement.prototype[name],
  writable: false,
  enumerable: false,
  configurable: false
}));

// const audioVisualizationDescriptors = describe(AudioVisualization.prototype);
// const audioVisualizationDescriptorsAdded = Object.keys(audioVisualizationDescriptors).filter((name) => Object.keys(audioDescriptors).indexOf(name) === -1).reduce((acc, name) => Object.assign(acc, { [name]: audioVisualizationDescriptors[name] }), {});
// const audioVisualizationDescriptorsMissing = Object.keys(audioDescriptors).filter((name) => Object.keys(audioVisualizationDescriptors).indexOf(name) === -1).reduce((acc, name) => Object.assign(acc, { [name]: audioDescriptors[name] }), {});

// console.log("allDescriptors", allDescriptors);
// console.log("audioDescriptors", audioDescriptors);
// console.log("audioVisualizationDescriptors", audioVisualizationDescriptors);
// console.log("audioVisualizationDescriptorsAdded", audioVisualizationDescriptorsAdded);
// console.log("audioVisualizationDescriptorsMissing", audioVisualizationDescriptorsMissing);

console.log("audioEvents", audioEvents);
console.log("audioAttributes", audioAttributes);
console.log("audioProperties", audioProperties);
console.log("audioMethods", audioMethods);
console.log("audioConstants", audioConstants);

export default AudioVisualization;
