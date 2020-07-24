import Visualization from "./Visualization.js";

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

    div.visualization {
      flex: auto;
      position: relative;
      font-size: 14px;
      font-family: monospace;
      width: 100%;
      height: 100%;
    }

    canvas {
      display: block;
      width: 100%;
      height: 100%;
    }

    #loading-container {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      transition: all 400ms;
    }

    #loading-container>h1 {
      margin: 0;
      font-size: 1em;
      font-weight: normal;
      text-align: center;
      color: #fff;
    }

    #loading-container>p {
      margin: 0.2em 0;
      font-size: 0.8em;
      text-align: center;
      text-transform: uppercase;
      color: #aaa;
    }

    #error-container {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      padding: 0.6em 1.2em;
      border: 0.2em solid #ff667f;
      border-radius: 0.4em;
      background-color: #ff3354;
    }
    
    #error-container>h1 {
      margin: 0;
      font-size: 1.2em;
      color: #ffe5ea;
    }

    #error-container>p {
      margin: 0.4em 0;
      font-size: 1em;
      color: #ffccd4;
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
      width: 100%;
      height: 100%;
      background: none;
      outline: none;
      border: none;
      cursor: pointer;
    }
    
    #play-pause-svg { 
      width: 100px;
      margin: 0 auto;
      fill: #fff;
      padding: 3rem;
      transition: 0.6s opacity;
      transition-delay: 0.4s;
    }
    
    #play-pause-svg.playing {
      opacity: 0;
    }
  </style>
  <div class="visualization">
    <canvas></canvas>
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

    this.paused = true;

    const shadowRoot = this.attachShadow({ mode: "closed" });
    shadowRoot.appendChild(template.content.cloneNode(true));

    const playPauseButton = shadowRoot.getElementById("play-pause-button");
    const playPauseSvg = shadowRoot.getElementById("play-pause-svg");
    const leftToPlay = shadowRoot.getElementById("left-to-play");
    const rightToPlay = shadowRoot.getElementById("right-to-play");
    const leftToPause = shadowRoot.getElementById("left-to-pause");
    const rightToPause = shadowRoot.getElementById("right-to-pause");

    playPauseButton.addEventListener("click", () => {
      if (this.paused) {
        this.play();
        playPauseSvg.classList.add("playing");
        leftToPause.beginElement();
        rightToPause.beginElement();
      } else {
        this.pause();
        playPauseSvg.classList.remove("playing");
        leftToPlay.beginElement();
        rightToPlay.beginElement();
      }
    });

    this._animationCallback = () => {
      this._requestAnimation();
      this._dispatchPaintEvent();
    };
  }

  

  play() {
    this.paused = false;

    this._load("/content/audio/new_year_dubstep_minimix.ogg");
  }

  pause() {
    this.paused = true;

    if (this._audioBufferSource) {
      this._audioBufferSource.stop();
      this._audioBufferSource = undefined;
    }
  }

  // set audioContext(value) {
  //   //console.log(`${this.id || "(unknown)"}.audioContext (set)`, { value });

  //   const oldValue = this._audioContext;
  //   const newValue = value || null;

  //   if (oldValue) {
  //     this._audioSourceNode.disconnect(oldValue.destination);
  //     this._audioSourceNode = null;
  //   }

  //   if (newValue) {
  //     this._audioSourceNode = newValue.createMediaElementSource(this._audioElement);
  //     this._audioSourceNode.connect(newValue.destination);
  //   }

  //   this._audioContext = newValue;
  // }

  _load(url) {
    if (!url) {
      throw new Error("URL required.");
    }

    this.url = url;

    this._audioContext = new AudioContext();
    // this._audioSourceNode = this._audioContext.createMediaElementSource(new HTMLAudioElement());
    // this._audioSourceNode.connect(this._audioContext.destination);

    return new Promise((resolve, reject) => {

      const request = new XMLHttpRequest();

      // this.onLoading("Loading Audio Buffer");

      request.addEventListener("load", () => {
        const { status, statusText, response } = request;

        if (status < 400) {
          // this.onLoading("Decoding Audio Data");

          this._analyser = this._audioContext.createAnalyser();
          // this.analyser.fftSize = Constants.FFT_SIZE;
          // this.analyser.minDecibels = Constants.MIN_DECIBELS;
          // this.analyser.maxDecibels = Constants.MAX_DECIBELS;
          // this.analyser.smoothingTimeConstant = Constants.SMOOTHING_TIME;

          this._audioContext.decodeAudioData(response, (audioBuffer) => {
            // this.onLoading("Ready");

            this._audioBuffer = audioBuffer;
            this._gainNode = this._audioContext.createGain();
            this._gainNode.connect(this._analyser);
            this._analyser.connect(this._audioContext.destination);

            this._audioBufferSource = this._audioContext.createBufferSource();
            this._audioBufferSource.buffer = this._audioBuffer;
            this._audioBufferSource.loop = true;
            this._audioBufferSource.connect(this._gainNode);
      
            this._startedAt = this._pausedAt ? Date.now() - this._pausedAt : Date.now();
            this._pausedAt ? this._audioBufferSource.start(0, this._pausedAt / 1000) : this._audioBufferSource.start();

            // this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
            // this.timeData = new Uint8Array(this.analyser.frequencyBinCount);

            // for (var i = 0; i < Constants.TOTAL_STARS; i++) {
            //   this.stars.push(new Star(this));
            // }

            // for (var i = 0; i < Constants.TOTAL_POINTS; i++) {
            //   const angle = (i * 360) / Constants.TOTAL_POINTS;
            //   const value = Math.random() * Constants.RANDOM_POINT_VALUE;
            //   this.points.push(new Point(this, angle, value));
            // }

            // for (var i = 0; i < Constants.TOTAL_AVG_POINTS; i++) {
            //   const angle = (i * 360) / Constants.TOTAL_AVG_POINTS;
            //   const value = Math.random() * Constants.RANDOM_POINT_VALUE;
            //   this.avg_points.push(new Point(this, angle, value));
            // }

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
      request.open("GET", url, true);
      request.send();
    }).then(this.onLoadCompleted.bind(this), this.onLoadFailed.bind(this));
  }

  _onLoading(step) {
    // const loadingElement = this.element.querySelector(".loading");
    // loadingElement.innerHTML = `<h1>Loading&hellip;</h1><p>&ndash; ${step} &ndash;</p>`;
    // loadingElement.classList.remove("hidden");
  }

  _onLoadCompleted() {
    // const loadingElement = this.element.querySelector(".loading");
    // loadingElement.classList.add("hidden");

    // this.play();
  }

  _onLoadFailed(error) {
    console.error(error);

    // const loadingElement = this.element.querySelector(".loading");
    // loadingElement.classList.add("hidden");

    // const errorElement = this.element.querySelector(".error");

    // if (error.message === "Web Audio API unsupported.") {
    //   errorElement.innerHTML = "<h1>Audio Unsupported</h1><p>Sorry! This visualization requires the <a href=\"http://caniuse.com/#feat=audio-api\" target=\"_blank\">Web Audio API</a>.</p>";
    // } else {
    //   errorElement.innerHTML = "<h1>Error Occurred</h1><p>Oops! An unexpected error occurred. Please <a>try again</a>.</p>";
    //   errorElement.querySelector("a").addEventListener("click", this.onReloadClick);
    // }

    // errorElement.classList.remove("hidden");
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

  _dispatchPaintEvent() {
    //console.log(`${this.id || "(unknown)"}._dispatchPaintEvent`);

    this.dispatchEvent(new Event("paint"));
  }
}

export default AudioVisualization;
