import Visualization from "./Visualization.js";
import { getPropertyDescriptors, diff } from "./utilities.js";

const baseDescriptors = getPropertyDescriptors(HTMLElement);
const audioDescriptors = getPropertyDescriptors(HTMLAudioElement);

Object.assign(audioDescriptors.autoplay, { attribute: "autoplay", empty: true });
Object.assign(audioDescriptors.controls, { attribute: "controls", empty: true });
Object.assign(audioDescriptors.crossOrigin, { attribute: "crossorigin", empty: false });
Object.assign(audioDescriptors.defaultMuted, { attribute: "muted", empty: true });
Object.assign(audioDescriptors.loop, { attribute: "loop", empty: true });
Object.assign(audioDescriptors.onencrypted, { attribute: "onencrypted", empty: false });
Object.assign(audioDescriptors.onwaitingforkey, { attribute: "onwaitingforkey", empty: false });
Object.assign(audioDescriptors.preload, { attribute: "preload", empty: false });
Object.assign(audioDescriptors.src, { attribute: "src", empty: false });

const baseDescriptorKeys = Object.keys(baseDescriptors);
const audioDescriptorKeys = Object.keys(audioDescriptors);

const audioEvents = audioDescriptorKeys.filter((key) => /^on(abort|canplay|canplaythrough|cuechange|durationchange|emptied|encrypted|ended|error|loadeddata|loadedmetadata|loadstart|pause|play|playing|progress|ratechange|seeked|seeking|stalled|suspend|timeupdate|volumechange|waiting|waitingforkey)$/.test(key)).sort();
const audioProperties = audioDescriptorKeys.filter((key) => !baseDescriptorKeys.includes(key) && (typeof audioDescriptors[key].get === "function" || typeof audioDescriptors[key].set === "function")).sort();
const audioMethods = audioDescriptorKeys.filter((key) => !baseDescriptorKeys.includes(key) && typeof audioDescriptors[key].value === "function").sort();
const audioConstants = audioDescriptorKeys.filter((key) => !baseDescriptorKeys.includes(key) && audioDescriptors[key].hasOwnProperty("value") && !audioDescriptors[key].writable).sort();
const observedAttributes = audioDescriptorKeys.filter((key) => !baseDescriptorKeys.includes(key) && audioDescriptors[key].hasOwnProperty("attribute")).map((key) => audioDescriptors[key].attribute).concat("onpaint").sort();

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
    new Visualization(this);

    const shadowRoot = this.attachShadow({ mode: "closed" });
    shadowRoot.appendChild(template.content.cloneNode(true));

    this._audioElement = shadowRoot.querySelector("audio");
    this._canvasElement = shadowRoot.querySelector("canvas");
    this._canvasContext = this._canvasElement.getContext("2d");
    this._audioSourceNode = null;
    this._audioContext = null;
    this._onpaint = null;

    this._animationCallback = () => {
      this._requestAnimation();
      this._dispatchPaintEvent();
    };

    const audioEventHandler = (event) => this._dispatchAudioEvent(event);
    audioEvents.forEach((key) => this._audioElement[key] = audioEventHandler);
  }

  static get observedAttributes() {
    //console.log("AudioVisualization.observedAttributes (get)");

    return observedAttributes;
  }

  get audioContext() {
    //console.log(`${this.id || "(unknown)"}.audioContext (get)`);

    return this._audioContext;
  }

  set audioContext(value) {
    //console.log(`${this.id || "(unknown)"}.audioContext (set)`, { value });

    const oldValue = this._audioContext;
    const newValue = value || null;

    if (oldValue) {
      this._audioSourceNode.disconnect(oldValue.destination);
      this._audioSourceNode = null;
    }

    if (newValue) {
      this._audioSourceNode = newValue.createMediaElementSource(this._audioElement);
      this._audioSourceNode.connect(newValue.destination);
    }

    this._audioContext = newValue;
  }

  get canvasContext() {
    //console.log(`${this.id || "(unknown)"}.canvasContext (get)`);

    return this._canvasContext;
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

    if (name === "onpaint") {
      this.onpaint = (newValue !== null) ? new Function("event", newValue) : null;
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
    //console.log(`${this.id || "(unknown)"}._cancelAnimation`);

    cancelAnimationFrame(this._animationRequestId);
  }

  _dispatchAudioEvent(event) {
    //console.log(`${this.id || "(unknown)"}._dispatchAudioEvent`, { event });

    this.dispatchEvent(new event.constructor(event.type, event));
  }

  _dispatchPaintEvent() {
    //console.log(`${this.id || "(unknown)"}._dispatchPaintEvent`);

    this.dispatchEvent(new Event("paint"));
  }
}

audioProperties.filter((key) => audioDescriptors[key].hasOwnProperty("attribute")).forEach((key) => Object.defineProperty(AudioVisualization.prototype, key, {
  get: (audioDescriptors[key].empty) ? new Function(`return this.hasAttribute("${audioDescriptors[key].attribute}");`) : new Function(`return this.getAttribute("${audioDescriptors[key].attribute}");`),
  set: (audioDescriptors[key].empty) ? new Function("value", `if (value) this.setAttribute("${audioDescriptors[key].attribute}", ""); else this.removeAttribute("${audioDescriptors[key].attribute}");`) : new Function("value", `this.setAttribute("${audioDescriptors[key].attribute}", value);`),
  enumerable: false,
  configurable: true
}));

audioProperties.filter((key) => !audioDescriptors[key].hasOwnProperty("attribute")).forEach((key) => Object.defineProperty(AudioVisualization.prototype, key, {
  get: (typeof audioDescriptors[key].get === "function") ? new Function(`return this._audioElement.${key};`) : undefined,
  set: (typeof audioDescriptors[key].set === "function") ? new Function("value", `this._audioElement.${key} = value;`) : undefined,
  enumerable: false,
  configurable: true
}));

audioMethods.forEach((key) => Object.defineProperty(AudioVisualization.prototype, key, {
  value: new Function("...args", `return this._audioElement.${key}(...args);`),
  writable: true,
  enumerable: false,
  configurable: true
}));

audioConstants.forEach((key) => Object.defineProperty(AudioVisualization.prototype, key, {
  value: audioDescriptors[key].value,
  writable: false,
  enumerable: false,
  configurable: false
}));

// const audioVisualizationDescriptors = getPropertyDescriptors(AudioVisualization);
// const audioVisualizationDescriptorsAdded = diff(audioVisualizationDescriptors, audioDescriptors);
// const audioVisualizationDescriptorsMissing = diff(audioDescriptors, audioVisualizationDescriptors);

// console.log("baseDescriptors", baseDescriptors);
// console.log("audioDescriptors", audioDescriptors);
// console.log("audioVisualizationDescriptors", audioVisualizationDescriptors);
// console.log("audioVisualizationDescriptorsAdded", audioVisualizationDescriptorsAdded);
// console.log("audioVisualizationDescriptorsMissing", audioVisualizationDescriptorsMissing);
// console.log("audioEvents", audioEvents);
// console.log("audioProperties", audioProperties);
// console.log("audioMethods", audioMethods);
// console.log("audioConstants", audioConstants);
// console.log("observedAttributes", observedAttributes);

export default AudioVisualization;
