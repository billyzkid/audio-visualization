import Star from "./Star.js";

const fftSize = 1024;

class Visualization {
  constructor(element) {
    this.element = element;
  }

  load(url) {
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

        if (error.message === "Web Audio API Unsupported") {
          this.showError("Audio Unsupported", "Sorry! This visualization requires the <a href=\"http://caniuse.com/#feat=audio-api\" target=\"_blank\">Web Audio API</a>.");
        } else {
          this.showError("Error Occurred", "Oops! An unexpected error occurred. Please <a href=\"#\">try again</a>.");
          const linkElement = this.element.querySelector(".error>p>a");

          linkElement.addEventListener("click", () => {
            this.load("ogg/new_year_dubstep_minimix.ogg");
            return false;
          });
        }
      });
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

  createCanvasElement() {
    const canvasElement = document.createElement("canvas");

    return canvasElement;
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

  getCanvasContext() {
    const canvasElement = this.element.querySelector("canvas");
    return canvasElement.getContext("2d");
  }

  createAudioContext() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) {
      throw new Error("Web Audio API Unsupported");
    }

    return new AudioContext();
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
}

export default Visualization;
