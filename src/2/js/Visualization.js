import Star from "./Star.js";

class Visualization {
  constructor(element) {
    if (!element) {
      throw new Error("Element required.");
    }

    this.element = element;
  }

  load(url) {
    if (!url) {
      throw new Error("URL required.");
    }

    this.url = url;

    return new Promise((resolve, reject) => {
      const element = this.element;
      element.classList.add("visualization");
      element.innerHTML = "";

      const canvasElement = document.createElement("canvas");
      element.appendChild(canvasElement);

      const playElement = document.createElement("a");
      playElement.className = "play hidden";
      playElement.innerHTML = "Play";
      playElement.addEventListener("click", this.onPlayClick.bind(this));
      element.appendChild(playElement);

      const pauseElement = document.createElement("a");
      pauseElement.className = "pause hidden";
      pauseElement.innerHTML = "Pause";
      pauseElement.addEventListener("click", this.onPauseClick.bind(this));
      element.appendChild(pauseElement);

      const loadingElement = document.createElement("div");
      loadingElement.className = "loading hidden";
      element.appendChild(loadingElement);

      const errorElement = document.createElement("div");
      errorElement.className = "error hidden";
      element.appendChild(errorElement);

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
    }).then(
      this.onLoadCompleted.bind(this),
      this.onLoadFailed.bind(this));
  }

  reload() {
    return this.load(this.url);
  }

  onLoading(step) {
    const loadingElement = this.element.querySelector(".loading");
    loadingElement.innerHTML = `<h1>Loading&hellip;</h1><p>&ndash; ${step} &ndash;</p>`;
    loadingElement.classList.remove("hidden");
  }

  onLoadCompleted(result) {
    console.log(result);

    const loadingElement = this.element.querySelector(".loading");
    loadingElement.classList.add("hidden");

    const { renderingContext, audioContext, audioBuffer } = result;
    this.render(renderingContext, audioContext, audioBuffer);
  }

  onLoadFailed(error) {
    console.error(error);

    const loadingElement = this.element.querySelector(".loading");
    loadingElement.classList.add("hidden");

    const errorElement = this.element.querySelector(".error");

    if (error.message === "Web Audio API unsupported.") {
      errorElement.innerHTML = "<h1>Audio Unsupported</h1><p>Sorry! This visualization requires the <a href=\"http://caniuse.com/#feat=audio-api\" target=\"_blank\">Web Audio API</a>.</p>";
    } else {
      errorElement.innerHTML = "<h1>Error Occurred</h1><p>Oops! An unexpected error occurred. Please <a>try again</a>.</p>";
      errorElement.querySelector("a").addEventListener("click", this.onReloadClick);
    }

    errorElement.classList.remove("hidden");
  }

  onReloadClick(event) {
    event.preventDefault();
    this.reload();
  }

  onPlayClick(event) {
    event.preventDefault();
    this.play();
  }

  onPauseClick(event) {
    event.preventDefault();
    this.pause();
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

  play() {
    console.log("Play!");
  }

  pause() {
    console.log("Pause!");
  }
}

export default Visualization;
