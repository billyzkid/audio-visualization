import Star from "./Star.js";

const audioUrl = "ogg/new_year_dubstep_minimix.ogg";
const fftSize = 1024;

class Visualization {
  constructor(elementId) {
    console.log("Visualization.constructor", { elementId });
    this.elementId = elementId;
  }

  initialize() {
    this.initializeElement();
    this.initializeAudio();
  }

  resize() {
  }

  initializeElement() {
    const element = document.getElementById(this.elementId);
    element.setAttribute("class", "visualization");
    element.innerHTML = "";

    const loadingElement = this.createLoadingElement();
    element.appendChild(loadingElement);

    const audioUnsupportedElement = this.createAudioUnsupportedElement();
    element.appendChild(audioUnsupportedElement);

    const canvasElement = this.createCanvasElement();
    element.appendChild(canvasElement);

    this.canvasContext = canvasElement.getContext("2d");
    this.element = element;
  }

  createLoadingElement() {
    const element = document.createElement("div");
    element.setAttribute("class", "loading hidden");

    const childElement1 = document.createElement("h1");
    childElement1.innerHTML = "Loading&hellip;";
    element.appendChild(childElement1);

    const childElement2 = document.createElement("p");
    element.appendChild(childElement2);

    return element;
  }

  showLoadingElement() {
    const element = this.element.querySelector(".loading");
    element.setAttribute("class", "loading");
  }

  hideLoadingElement() {
    const element = this.element.querySelector(".loading");
    element.setAttribute("class", "loading hidden");
  }

  updateLoadingText(text) {
    const element = this.element.querySelector(".loading>p");
    element.innerHTML = `&ndash; ${text} &ndash;`;
  }

  createAudioUnsupportedElement() {
    const element = document.createElement("div");
    element.setAttribute("class", "audio-unsupported hidden");

    const childElement1 = document.createElement("h1");
    childElement1.innerHTML = "Audio Unsupported";
    element.appendChild(childElement1);

    const childElement2 = document.createElement("p");
    childElement2.innerHTML = "Sorry, this visualization requires the Web Audio API.";
    element.appendChild(childElement2);

    const childElement3 = document.createElement("a");
    childElement3.setAttribute("href", "http://caniuse.com/#feat=audio-api");
    childElement3.setAttribute("target", "_blank");
    childElement3.innerHTML = "Browser Support";
    element.appendChild(childElement3);

    return element;
  }

  showAudioUnsupportedElement() {
    const element = this.element.querySelector(".audio-unsupported");
    element.setAttribute("class", "audio-unsupported");
  }

  hideAudioUnsupportedElement() {
    const element = this.element.querySelector(".audio-unsupported");
    element.setAttribute("class", "audio-unsupported hidden");
  }

  createCanvasElement() {
    const element = document.createElement("canvas");
    element.setAttribute("class", "hidden");

    return element;
  }

  showCanvasElement() {
    const element = this.element.querySelector("canvas");
    element.removeAttribute("class");
  }

  hideCanvasElement() {
    const element = this.element.querySelector("canvas");
    element.setAttribute("class", "hidden");
  }

  initializeAudio() {
    if (!AudioContext) {
      this.showAudioUnsupportedElement();
      return Promise.reject("Audio unsupported");
    } else {

      this.showLoadingElement();
      this.updateLoadingText("Loading Audio Buffer");

      return new Promise((resolve, reject) => {
        const xmlHttpRequest = new XMLHttpRequest();

        xmlHttpRequest.open("GET", audioUrl, true);
        xmlHttpRequest.responseType = "arraybuffer";

        xmlHttpRequest.onerror = (event) => reject(event.error);
        xmlHttpRequest.onload = (event) => {
          this.updateLoadingText("Decoding Audio Data");

          const audioContext = new AudioContext();
          const audioAnalyser = audioContext.createAnalyser();

          audioAnalyser.fftSize = fftSize;
          audioAnalyser.minDecibels = -100;
          audioAnalyser.maxDecibels = -30;
          audioAnalyser.smoothingTimeConstant = 0.8;

          audioAnalyser.context.decodeAudioData(xmlHttpRequest.response, (data) => {
            this.updateLoadingText("Ready");

            resolve(data);
          }, (error) => {
            reject(error);
          });
        };

        xmlHttpRequest.send();
      });
    }
  }
}

export default Visualization;
