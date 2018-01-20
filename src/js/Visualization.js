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
    this.initializeAudio().then(
      ({ canvasContext, audioContext, audioBuffer }) => {
        console.log({ canvasContext, audioContext, audioBuffer });

        const audioAnalyser = audioContext.createAnalyser();
        audioAnalyser.fftSize = fftSize;
        audioAnalyser.minDecibels = -100;
        audioAnalyser.maxDecibels = -30;
        audioAnalyser.smoothingTimeConstant = 0.8;
      },
      (error) => {
        console.error(error);

        if (error.message === "Audio unsupported.") {
          this.showError("Audio Unsupported", "Sorry! This visualization requires the <a href=\"http://caniuse.com/#feat=audio-api\" target=\"_blank\">Web Audio API</a>.");
        } else {
          this.showError("Error Occurred", "Oops! An unexpected error occurred. Please <a href=\"javascript:document.location.reload(true);\">try again</a>.");
        }
      });
  }

  resize() {
  }

  initializeElement() {
    this.element = document.getElementById(this.elementId);
    this.element.classList.add("visualization");
    this.element.innerHTML = "";

    const loadingElement = this.createLoadingElement();
    this.element.appendChild(loadingElement);

    const errorElement = this.createErrorElement();
    this.element.appendChild(errorElement);

    const canvasElement = this.createCanvasElement();
    this.element.appendChild(canvasElement);
  }

  createLoadingElement() {
    const loadingElement = document.createElement("div");
    loadingElement.className = "loading hidden";

    const titleElement = document.createElement("h1");
    titleElement.innerHTML = "Loading&hellip;";
    loadingElement.appendChild(titleElement);

    const descriptionElement = document.createElement("p");
    loadingElement.appendChild(descriptionElement);

    return loadingElement;
  }

  hideLoadingElement() {
    const loadingElement = this.element.querySelector(".loading");
    loadingElement.classList.add("hidden");
  }

  showLoadingElement() {
    const loadingElement = this.element.querySelector(".loading");
    loadingElement.classList.remove("hidden");
  }

  showLoadingDescription(description) {
    const descriptionElement = this.element.querySelector(".loading>p");
    descriptionElement.innerHTML = `&ndash; ${description} &ndash;`;

    this.hideErrorElement();
    this.showLoadingElement();
  }

  createErrorElement() {
    const errorElement = document.createElement("div");
    errorElement.className = "error hidden";

    const titleElement = document.createElement("h1");
    errorElement.appendChild(titleElement);

    const descriptionElement = document.createElement("p");
    errorElement.appendChild(descriptionElement);

    return errorElement;
  }

  hideErrorElement() {
    const errorElement = this.element.querySelector(".error");
    errorElement.classList.add("hidden");
  }

  showErrorElement() {
    const errorElement = this.element.querySelector(".error");
    errorElement.classList.remove("hidden");
  }

  showError(title, description) {
    const titleElement = this.element.querySelector(".error>h1");
    titleElement.innerHTML = title;

    const descriptionElement = this.element.querySelector(".error>p");
    descriptionElement.innerHTML = description;

    this.hideLoadingElement();
    this.showErrorElement();
  }

  createCanvasElement() {
    const canvasElement = document.createElement("canvas");
    canvasElement.className = "hidden";

    return canvasElement;
  }

  showCanvasElement() {
    const canvasElement = this.element.querySelector("canvas");
    canvasElement.classList.add("hidden");
  }

  hideCanvasElement() {
    const canvasElement = this.element.querySelector("canvas");
    canvasElement.classList.remove("hidden");
  }

  getCanvasContext() {
    const canvasElement = this.element.querySelector("canvas");
    return canvasElement.getContext("2d");
  }

  createAudioContext() {
    if (window.AudioContext) {
      return new AudioContext();
    } else {
      throw new Error("Audio unsupported.");
    }
  }

  initializeAudio() {
    return new Promise((resolve, reject) => {
      this.showLoadingDescription("Loading Audio Buffer");

      const canvasContext = this.getCanvasContext();
      const audioContext = this.createAudioContext();
      const request = new XMLHttpRequest();

      request.responseType = "arraybuffer";
      request.open("GET", audioUrl, true);

      request.onload = (event) => {
        this.showLoadingDescription("Decoding Audio Data");

        audioContext.decodeAudioData(request.response, (audioBuffer) => {
          this.showLoadingDescription("Ready");

          resolve({ canvasContext, audioContext, audioBuffer });
        }, (error) => {
          reject(error);
        });
      };

      request.onerror = (event) => {
        reject(event.error);
      };

      request.send();
    });
  }
}

export default Visualization;
