import Star from "./Star.js";

const fftSize = 1024;

class Visualization {
  constructor(element) {
    this.element = element;
  }

  load(url) {
    this.url = url;

    this.initializeElement();

    return this.initializeAudio(url).then(
      ({ canvasContext, audioContext, audioBuffer }) => {
        console.log({ canvasContext, audioContext, audioBuffer });

        const audioAnalyser = audioContext.createAnalyser();
        audioAnalyser.fftSize = fftSize;
        audioAnalyser.minDecibels = -100;
        audioAnalyser.maxDecibels = -30;
        audioAnalyser.smoothingTimeConstant = 0.8;
      }).catch((error) => {
        console.error(error);

        this.showError(error);
      });
  }

  reload() {
    return this.load(this.url);
  }

  initializeElement() {
    this.element.classList.add("visualization");
    this.element.innerHTML = "";

    const canvasElement = this.createCanvasElement();
    this.element.appendChild(canvasElement);

    const loadingElement = this.createLoadingElement();
    this.element.appendChild(loadingElement);

    const errorElement = this.createErrorElement();
    this.element.appendChild(errorElement);
  }

  initializeAudio(url) {
    return new Promise((resolve, reject) => {
      this.showLoadingDescription("Loading Audio Buffer");

      const canvasContext = this.getCanvasContext();
      const audioContext = this.createAudioContext();
      const request = new XMLHttpRequest();

      request.addEventListener("load", () => {
        if (request.status < 400) {
          this.showLoadingDescription("Decoding Audio Data");

          audioContext.decodeAudioData(request.response, (audioBuffer) => {
            this.showLoadingDescription("Ready");

            resolve({ canvasContext, audioContext, audioBuffer });
          }, (error) => {
            reject(error);
          });
        } else {
          reject(`Request failed: ${request.statusText}`);
        }
      });

      request.addEventListener("error", (event) => {
        reject(event.error);
      });

      request.responseType = "arraybuffer";
      request.open("GET", url, true);
      request.send();
    });
  }

  createCanvasElement() {
    const canvasElement = document.createElement("canvas");

    return canvasElement;
  }

  createLoadingElement() {
    const loadingElement = document.createElement("div");
    loadingElement.className = "loading hidden";
    loadingElement.innerHTML = "<h1>Loading&hellip;</h1><p></p>";

    return loadingElement;
  }

  createErrorElement() {
    const errorElement = document.createElement("div");
    errorElement.className = "error hidden";
    errorElement.innerHTML = "<h1></h1><p></p>";

    return errorElement;
  }

  showLoadingDescription(description) {
    const loadingElement = this.element.querySelector(".loading");
    const errorElement = this.element.querySelector(".error");

    loadingElement.querySelector("p").innerHTML = `&ndash; ${description} &ndash;`;

    this.hideElement(errorElement);
    this.showElement(loadingElement);
  }

  showError(error) {
    const loadingElement = this.element.querySelector(".loading");
    const errorElement = this.element.querySelector(".error");

    if (error.message === "Web Audio API unsupported.") {
      errorElement.querySelector("h1").innerHTML = "Audio Unsupported";
      errorElement.querySelector("p").innerHTML = "Sorry! This visualization requires the <a href=\"http://caniuse.com/#feat=audio-api\" target=\"_blank\">Web Audio API</a>.";
    } else {
      errorElement.querySelector("h1").innerHTML = "Error Occurred";
      errorElement.querySelector("p").innerHTML = "Oops! An unexpected error occurred. Please <a href=\"#\">try again</a>.";
      errorElement.querySelector("p>a").addEventListener("click", () => { this.reload(); return false; });
    }

    this.hideElement(loadingElement);
    this.showElement(errorElement);
  }

  hideElement(element) {
    element.classList.add("hidden");
  }

  showElement(element) {
    element.classList.remove("hidden");
  }

  getCanvasContext() {
    const canvasElement = this.element.querySelector("canvas");
    return canvasElement.getContext("2d");
  }

  createAudioContext() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) {
      throw new Error("Web Audio API unsupported.");
    }

    return new AudioContext();
  }
}

export default Visualization;
