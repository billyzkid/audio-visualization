import * as Constants from "./Constants.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: inline-flex;
      flex-direction: column;
      align-items: flex-start;
    }

    :host([hidden]) {
      display: none
    }

    #viz-container {
      flex: auto;
      position: relative;
      font-size: 14px;
      font-family: monospace;
      width: 100%;
      height: 100%;
    }

    #canvas {
      display: block;
      width: 100%;
      height: 100%;
    }

    #loading-container {
      position: absolute;
      bottom: 0%;
      left: 50%;
      margin-bottom: 10px;
      transform: translate(-50%, 0%);
      transition: all 400ms;
    }

    #loading-container>h1 {
      color: #fff;
      font-size: 1em;
      font-weight: normal;
      text-align: center;
      margin: 0;
    }

    #loading-container>p {
      color: #aaa;
      font-size: 0.8em;
      text-align: center;
      text-transform: uppercase;
      margin: 0.2em 0;
    }

    #error-container {
      position: absolute;
      top: 50%;
      left: 50%;
      padding: 0.6em 1.2em;
      border: 0.2em solid #ff667f;
      border-radius: 0.4em;
      background-color: #ff3354;
      transform: translate(-50%, -50%);
    }
    
    #error-container>h1 {
      color: #ffe5ea;
      font-size: 1.2em;
      margin: 0;
    }

    #error-container>p {
      color: #ffccd4;
      font-size: 1em;
      margin: 0.4em 0;
    }

    #error-container>p>a {
      color: inherit;
      cursor: pointer;
    }

    #loading-container.hidden,
    #error-container.hidden {
      opacity: 0;
      visibility: hidden;
    }

    #play-pause-button {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      font-size: 0;
      background: none;
      outline: none;
      border: none;
      cursor: pointer;
      overflow: hidden;
    }
    
    #play-pause-svg { 
      fill: #fff;
      width: 10%;
      transition: opacity 0.6s ease 0.4s;
    }
    
    #play-pause-svg.playing {
      opacity: 0;
    }
  </style>
  <div id="viz-container">
    <canvas id="canvas"></canvas>
    <button id="play-pause-button">
      <svg id="play-pause-svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 50 50">
        <polygon id="left-bar" points="12,0 25,11.5 25,39 12,50" />
        <polygon id="right-bar" points="25,11.5 39.7,24.5 41.5,26 39.7,27.4 25,39" />
        <animate id="left-to-pause" xlink:href="#left-bar" attributeName="points" to="7,3 19,3 19,47 7,47" dur="0.3s" begin="indefinite" fill="freeze" />
        <animate id="left-to-play" xlink:href="#left-bar" attributeName="points" to="12,0 25,11.5 25,39 12,50" dur="0.3s" begin="indefinite" fill="freeze" />
        <animate id="right-to-pause" xlink:href="#right-bar" attributeName="points" to="31,3 43,3 43,26 43,47 31,47" dur="0.3s" begin="indefinite" fill="freeze" />
        <animate id="right-to-play" xlink:href="#right-bar" attributeName="points" to="25,11.5 39.7,24.5 41.5,26 39.7,27.4 25,39" dur="0.3s" begin="indefinite" fill="freeze" />
      </svg>
    </button>
    <div id="loading-container" class="hidden"></div>
    <div id="error-container" class="hidden"></div>
  </div>
`;

class AudioVisualization extends HTMLElement {
  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: "closed" });
    shadowRoot.appendChild(template.content.cloneNode(true));

    const canvas = shadowRoot.getElementById("canvas");
    const playPauseButton = shadowRoot.getElementById("play-pause-button");
    const playPauseSvg = shadowRoot.getElementById("play-pause-svg");
    const leftToPlay = shadowRoot.getElementById("left-to-play");
    const rightToPlay = shadowRoot.getElementById("right-to-play");
    const leftToPause = shadowRoot.getElementById("left-to-pause");
    const rightToPause = shadowRoot.getElementById("right-to-pause");

    playPauseButton.addEventListener("click", () => {
      if (this._playing) {
        this.pause();
        playPauseSvg.classList.remove("playing");
        leftToPlay.beginElement();
        rightToPlay.beginElement();
      } else {
        this.play();
        playPauseSvg.classList.add("playing");
        leftToPause.beginElement();
        rightToPause.beginElement();
      }
    });

    this._playPauseButton = playPauseButton;
    this._loadingContainer = shadowRoot.getElementById("loading-container");
    this._errorContainer = shadowRoot.getElementById("error-container");
    this._canvasContext = canvas.getContext("2d");

    this._animationCallback = () => {
      this._requestAnimation();
      this._dispatchPaintEvent();
    };
  }

  get audioContext() {
    return this._audioContext || null;
  }

  get canvasContext() {
    return this._canvasContext || null;
  }

  get playing() {
    return this._playing || false;
  }

  get analyser() {
    return this._analyser || null;
  }

  get gainNode() {
    return this._gainNode || null;
  }

  get frequencyData() {
    return this._frequencyData || new Uint8Array();
  }

  get timeData() {
    return this._timeData || new Uint8Array();
  }

  get onpaint() {
    return this._onpaint;
  }

  set onpaint(value) {
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

  play() {
    if (!this._audioBufferSource) {
      this._load(this.getAttribute("src"));
    }
  }

  pause() {
    if (this._audioBufferSource) {
      this._audioBufferSource.stop();
      this._audioBufferSource = undefined;
    }

    this._pauseTime = Date.now() - this._playTime;
    this._playing = false;
  }

  connectedCallback() {
    this._requestAnimation();
  }

  disconnectedCallback() {
    this._cancelAnimation();
  }

  adoptedCallback() {
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "onpaint") {
      this.onpaint = (newValue !== null) ? new Function("event", newValue) : null;
    } else if (newValue !== null) {
      this._audioElement.setAttribute(name, newValue);
    } else {
      this._audioElement.removeAttribute(name);
    }
  }

  _requestAnimation() {
    this._animationRequestId = requestAnimationFrame(this._animationCallback);
  }

  _cancelAnimation() {
    cancelAnimationFrame(this._animationRequestId);
  }

  _dispatchPaintEvent() {
    this.dispatchEvent(new Event("paint"));
  }

  _load(source) {
    if (!source) {
      throw new Error("Source URL required.");
    }

    this._onLoading("Loading Audio Source");

    return new Promise((resolve, reject) => {

      const request = new XMLHttpRequest();

      request.addEventListener("load", () => {
        const { status, statusText, response } = request;

        if (status < 400) {
          this._onLoading("Decoding Audio Data");

          this._audioContext = new AudioContext();

          this._analyser = this._audioContext.createAnalyser();
          this._analyser.fftSize = Constants.FFT_SIZE;
          this._analyser.minDecibels = Constants.MIN_DECIBELS;
          this._analyser.maxDecibels = Constants.MAX_DECIBELS;
          this._analyser.smoothingTimeConstant = Constants.SMOOTHING_TIME;
          this._analyser.connect(this._audioContext.destination);

          this._gainNode = this._audioContext.createGain();
          this._gainNode.connect(this._analyser);

          this._audioContext.decodeAudioData(response, (audioBuffer) => {
            this._onLoading("Ready");

            this._audioBufferSource = this._audioContext.createBufferSource();
            this._audioBufferSource.buffer = audioBuffer;
            this._audioBufferSource.loop = true;
            this._audioBufferSource.connect(this._gainNode);

            this._frequencyData = new Uint8Array(this._analyser.frequencyBinCount);
            this._timeData = new Uint8Array(this._analyser.frequencyBinCount);

            if (this._pauseTime) {
              this._audioBufferSource.start(0, this._pauseTime / 1000);
            } else {
              this._audioBufferSource.start();
            }

            this._playTime = this._pauseTime ? Date.now() - this._pauseTime : Date.now();
            this._playing = true;

            resolve();
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
      request.open("GET", source, true);
      request.send();
    }).then(this._onLoaded.bind(this), this._onLoadFailed.bind(this));
  }

  _onLoading(message) {
    this._loadingContainer.innerHTML = `<h1>Loading&hellip;</h1><p>&ndash; ${message} &ndash;</p>`;
    this._loadingContainer.classList.remove("hidden");
  }

  _onLoaded() {
    this._loadingContainer.classList.add("hidden");
    this._errorContainer.classList.add("hidden");
  }

  _onLoadFailed(error) {
    console.error(error);

    this._playPauseButton.style.display = "none";
    this._loadingContainer.classList.add("hidden");

    this._errorContainer.innerHTML = `<h1>Error Occurred</h1><p>${error}</p>`;
    this._errorContainer.classList.remove("hidden");
  }
}

export default AudioVisualization;
