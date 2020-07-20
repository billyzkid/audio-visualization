//import Star from "./Star.js";

const FFT_SIZE = 1024;
const TOTAL_POINTS = 1024 / 2;
const TOTAL_AVG_POINTS = 64;

const PI = Math.PI;
const PI_TWO = PI * 2;
const PI_HALF = PI / 180;

var w = 0;
var h = 0;
var cx = 0;
var cy = 0;
var points = [];
var avg_points = [];

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

    this.element.addEventListener("resize", this.onResize.bind(this), false);
  }

  onResize() {
    console.log("Resize!");
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

  play() {
    console.log("Play!");
  }

  pause() {
    console.log("Pause!");
  }

  render(renderingContext, audioContext, audioBuffer) {
    this.animate(renderingContext);
    window.requestAnimationFrame(this.animate.bind(this, renderingContext));
  }

  animate(ctx) {
    console.log("Animate!");

    for (var i = 0; i < TOTAL_POINTS; i++) {
      points.push(new Point(i));
    }

    for (var i = 0; i < TOTAL_AVG_POINTS; i++) {
      avg_points.push(new AvgPoint(i));
    }

    this.clearCanvas(ctx);
    this.drawStarField(ctx);
    this.drawAverageCircle(ctx);
    this.drawWaveform(ctx);
  }

  clearCanvas(ctx) {
    var gradient = ctx.createLinearGradient(0, 0, 0, 0);
    gradient.addColorStop(0, "#000011");
    gradient.addColorStop(0.96, "#060D1F");
    gradient.addColorStop(1, "#02243F");

    ctx.beginPath();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 0, 0);
    ctx.fill();
    ctx.closePath();
  }

  drawStarField(ctx) {

  }

  drawAverageCircle(ctx) {

  }

  drawWaveform(ctx) {

  }
}

class Star {
  constructor() {
    var xc, yc;

    this.x = Math.random() * w - cx;
    this.y = Math.random() * h - cy;
    this.z = this.max_depth = Math.max(w/h);
    this.radius = 0.2;

    xc = this.x > 0 ? 1 : -1;
    yc = this.y > 0 ? 1 : -1;

    if (Math.abs(this.x) > Math.abs(this.y)) {
        this.dx = 1.0;
        this.dy = Math.abs(this.y / this.x);
    } else {
        this.dx = Math.abs(this.x / this.y);
        this.dy = 1.0;
    }

    this.dx *= xc;
    this.dy *= yc;
    this.dz = -0.1;

    this.ddx = .001 * this.dx;
    this.ddy = .001 * this.dy;

    if (this.y > (cy/2)) {
        this.color = "#B5BFD4";
    } else {
        if (avg > 110) {
            this.color = "#B5BFD4";
        } else if (avg > 140) {
            this.color = "#F451BA";
        } else {
            this.color = "#465677";
        }
    }
  }
}

class Point {
  constructor(index) {
    this.index = index;
    this.angle = (this.index * 360) / TOTAL_POINTS;
    this.value = Math.random() * 256;
    this.dx = this.x + this.value * Math.sin(PI_HALF * this.angle);
    this.dy = this.y + this.value * Math.cos(PI_HALF * this.angle);

    this.updateDynamics();
  }

  updateDynamics() {
    this.radius = Math.abs(w, h) / 10;
    this.x = cx + this.radius * Math.sin(PI_HALF * this.angle);
    this.y = cy + this.radius * Math.cos(PI_HALF * this.angle);
  }
}

class AvgPoint {
  constructor(index) {
    this.index = index;
    this.angle = (this.index * 360) / TOTAL_AVG_POINTS;
    this.value = Math.random() * 256;
    this.dx = this.x + this.value * Math.sin(PI_HALF * this.angle);
    this.dy = this.y + this.value * Math.cos(PI_HALF * this.angle);

    this.updateDynamics();
  }

  updateDynamics() {
    this.radius = Math.abs(w, h) / 10;
    this.x = cx + this.radius * Math.sin(PI_HALF * this.angle);
    this.y = cy + this.radius * Math.cos(PI_HALF * this.angle);
  }
}

export default Visualization;
