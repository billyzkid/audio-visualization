import Star from "./Star.js";

class Visualization {
  constructor(element) {
    this.element = element;
  }

  load(url) {
    this.url = url;

    return new Promise((resolve, reject) => {
      const element = this.element;
      element.classList.add("visualization");
      element.innerHTML = "";

      const canvasElement = document.createElement("canvas");
      element.appendChild(canvasElement);

      const loadingElement = document.createElement("div");
      loadingElement.className = "loading hidden";
      element.appendChild(loadingElement);

      const errorElement = document.createElement("div");
      errorElement.className = "error hidden";
      element.appendChild(errorElement);

      if (!url) {
        throw new Error("URL required.");
      }

      const renderingContext = this.getRenderingContext();
      const audioContext = this.createAudioContext();
      const request = new XMLHttpRequest();

      this.onLoading("Loading Audio Buffer");

      request.addEventListener("load", () => {
        const { status, statusText, response } = request;

        if (status < 400) {
          this.onLoading("Decoding Audio Data");

          audioContext.decodeAudioData(response, (audioBuffer) => {
            this.onLoading("Ready");

            resolve({ renderingContext, audioContext, audioBuffer });
          }, (error) => {
            reject(error);
          });
        } else {
          reject(`Request failed: ${statusText}`);
        }
      });

      request.addEventListener("error", (event) => {
        reject(event.error);
      });

      request.responseType = "arraybuffer";
      request.open("GET", url, true);
      request.send();
    }).then(({ renderingContext, audioContext, audioBuffer }) => {
      console.log({ renderingContext, audioContext, audioBuffer });
      this.onLoadCompleted();
      return this.render(renderingContext, audioContext, audioBuffer);
    }).catch((error) => {
      console.error(error);
      this.onLoadFailed(error);
    });
  }

  reload() {
    return this.load(this.url);
  }

  onLoading(step) {
    const loadingElement = this.element.querySelector(".loading");
    loadingElement.innerHTML = `<h1>Loading&hellip;</h1><p>&ndash; ${step} &ndash;</p>`;
    loadingElement.classList.remove("hidden");
  }

  onLoadCompleted() {
    const loadingElement = this.element.querySelector(".loading");
    loadingElement.classList.add("hidden");
  }

  onLoadFailed(error) {
    const loadingElement = this.element.querySelector(".loading");
    loadingElement.classList.add("hidden");

    const errorElement = this.element.querySelector(".error");

    if (error.message === "Web Audio API unsupported.") {
      errorElement.innerHTML = "<h1>Audio Unsupported</h1><p>Sorry! This visualization requires the <a href=\"http://caniuse.com/#feat=audio-api\" target=\"_blank\">Web Audio API</a>.</p>";
    } else {
      errorElement.innerHTML = "<h1>Error Occurred</h1><p>Oops! An unexpected error occurred. Please <a href=\"#\">try again</a>.</p>";
      errorElement.querySelector("a").addEventListener("click", () => { this.reload(); return false; });
    }

    errorElement.classList.remove("hidden");
  }

  getRenderingContext() {
    const canvasElement = this.element.querySelector("canvas");
    return canvasElement.getContext("2d")
  }

  createAudioContext() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) {
      throw new Error("Web Audio API unsupported.");
    }

    return new AudioContext();
  }

  render(renderingContext, audioContext, audioBuffer) {
    const audioAnalyser = audioContext.createAnalyser();
    audioAnalyser.fftSize = 1024;
    audioAnalyser.minDecibels = -100;
    audioAnalyser.maxDecibels = -30;
    audioAnalyser.smoothingTimeConstant = 0.8;
    audioAnalyser.connect(audioContext.destination);

    const gainNode = audioContext.createGain();
    gainNode.connect(audioAnalyser);

    //const frequencyData = new Uint8Array(audioAnalyser.frequencyBinCount);
    //const timeData = new Uint8Array(audioAnalyser.frequencyBinCount);

    //playing = true;
    //startedAt = pausedAt ? Date.now() - pausedAt : Date.now();
    //asource = null;
    const audioBufferSource = audioContext.createBufferSource();
    audioBufferSource.buffer = audioBuffer;
    audioBufferSource.loop = true;
    audioBufferSource.connect(gainNode);
    audioBufferSource.start()
    //pausedAt ? audioBufferSource.start(0, pausedAt / 1000) : audioBufferSource.start();

  }
}

export default Visualization;
