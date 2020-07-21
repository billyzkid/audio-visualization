//import Star from "./Star.js";

const PI_TWO = Math.PI * 2;
const PI_HALF = Math.PI / 180;

const fftSize = 1024;

const TOTAL_STARS = 1500;
const TOTAL_POINTS = 512;
const TOTAL_AVG_POINTS = 64;
const STARS_BREAK_POINT = 140;
const AVG_BREAK_POINT = 100;

const stars_color_1 = "#465677",
const stars_color_2 = "#B5BFD4",
const stars_color_3 = "#F451BA",

const bubble_avg_tick = 0.001;
const bubble_avg_color = "rgba(29, 36, 57, 0.1)";
const bubble_avg_color_2 = "rgba(29, 36, 57, 0.05)";
const bubble_avg_line_color = "rgba(77, 218, 248, 1)";
const bubble_avg_line_color_2 = "rgba(77, 218, 248, 1)";

class Visualization {
  constructor(element) {
    if (!element) {
      throw new Error("Element required.");
    }

    this.element = element;
    this.stars = [];
    this.points = [];
    this.avg_points = [];
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

      this.renderingContext = this.getRenderingContext();
      this.audioContext = this.createAudioContext();

      const request = new XMLHttpRequest();

      this.onLoading("Loading Audio Buffer");

      request.addEventListener("load", () => {
        const { status, statusText, response } = request;

        if (status < 400) {
          this.onLoading("Decoding Audio Data");

          this.analyser = this.audioContext.createAnalyser();
          this.analyser.fftSize = fftSize;
          this.analyser.minDecibels = -100;
          this.analyser.maxDecibels = -30;
          this.analyser.smoothingTimeConstant = 0.8;

          this.audioContext.decodeAudioData(response, (audioBuffer) => {
            this.onLoading("Ready");

            this.audioBuffer = audioBuffer;

            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);

            this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
            this.timeData = new Uint8Array(this.analyser.frequencyBinCount);

            var canvasWidth = this.renderingContext.canvas.offsetWidth;
            var canvasHeight = this.renderingContext.canvas.offsetHeight;
        
            for (var i = 0; i < TOTAL_STARS; i++) {
              this.stars.push(new Star(i, canvasWidth, canvasHeight));
            }
            
            for (var i = 0; i < TOTAL_POINTS; i++) {
              this.points.push(new Point(i, canvasWidth, canvasHeight));
            }
        
            for (var i = 0; i < TOTAL_AVG_POINTS; i++) {
              this.avg_points.push(new AvgPoint(i, canvasWidth, canvasHeight));
            }

            // resolve({ renderingContext, audioContext, audioBuffer });
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

    //const { renderingContext, audioContext, audioBuffer } = result;
    //this.render(renderingContext, audioContext, audioBuffer);
    this.render();
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
    this.play();
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
    
    this.playing = true;
    
    this.asource = this.audioContext.createBufferSource();
    this.asource.buffer = this.audioBuffer;
    this.asource.loop = true;
    this.asource.connect(this.gainNode);
    
    this.startedAt = this.pausedAt ? Date.now() - this.pausedAt : Date.now();
    this.pausedAt ? this.asource.start(0, this.pausedAt / 1000) : this.asource.start();

    this.animate();
  }

  pause() {
    console.log("Pause!");

    this.playing = false;

    if (this.asource) {
      this.asource.stop();
    }

    this.pausedAt = Date.now() - this.startedAt;
  }

  render(renderingContext, audioContext, audioBuffer) {
    this.animate();
  }

  animate() {
    console.log("Animate!");

    window.requestAnimationFrame(this.animate.bind(this));

    this.analyser.getByteFrequencyData(this.frequencyData);
    this.analyser.getByteTimeDomainData(this.timeData);

    var values = [].slice.call(this.frequencyData);
    var averageValue = values.reduce((a, b) => a + b) / values.length;
    this.avg = averageValue * this.gainNode.gain.value;

    this.clearCanvas();
    this.drawStarField();
    this.drawAverageCircle();
    this.drawWaveform();
  }

  clearCanvas() {
    var canvasWidth = this.renderingContext.canvas.offsetWidth;
    var canvasHeight = this.renderingContext.canvas.offsetHeight;
    var gradient = this.renderingContext.createLinearGradient(0, 0, 0, canvasHeight);

    gradient.addColorStop(0, "#000011");
    gradient.addColorStop(0.96, "#060D1F");
    gradient.addColorStop(1, "#02243F");

    this.renderingContext.fillStyle = gradient;
    this.renderingContext.globalCompositeOperation = "source-over";
    this.renderingContext.beginPath();
    this.renderingContext.fillRect(0, 0, canvasWidth, canvasHeight);
    this.renderingContext.fill();
    this.renderingContext.closePath();
  }

  drawStarField() {

  }

  drawAverageCircle() {
    var i, len, p, value, xc, yc;
    var rotation  = 0;

    var cx = this.renderingContext.canvas.offsetWidth / 2;
    var cy = this.renderingContext.canvas.offsetHeight / 2;

    if (this.avg > AVG_BREAK_POINT) {
        rotation += -bubble_avg_tick;
        value = this.avg + random() * 10;
        this.renderingContext.strokeStyle = bubble_avg_line_color_2;
        this.renderingContext.fillStyle = bubble_avg_color_2;
    } else {
        rotation += bubble_avg_tick;
        value = this.avg;
        this.renderingContext.strokeStyle = bubble_avg_line_color;
        this.renderingContext.fillStyle = bubble_avg_color;
    }

    this.renderingContext.beginPath();
    this.renderingContext.lineWidth = 1;
    this.renderingContext.lineCap = "round";

    this.renderingContext.save();
    this.renderingContext.translate(cx, cy);
    this.renderingContext.rotate(rotation);
    this.renderingContext.translate(-cx, -cy);
    this.renderingContext.moveTo(this.avg_points[0].dx, this.avg_points[0].dy);

    for (var i = 0, len = TOTAL_AVG_POINTS; i < len - 1; i++) {
        p = this.avg_points[i];
        p.dx = p.x + value * Math.sin(PI_HALF * p.angle);
        p.dy = p.y + value * Math.cos(PI_HALF * p.angle);
        xc = (p.dx + this.avg_points[i+1].dx) / 2;
        yc = (p.dy + this.avg_points[i+1].dy) / 2;

        this.renderingContext.quadraticCurveTo(p.dx, p.dy, xc, yc);
    }

    p = this.avg_points[i];
    p.dx = p.x + value * Math.sin(PI_HALF * p.angle);
    p.dy = p.y + value * Math.cos(PI_HALF * p.angle);
    xc = (p.dx + this.avg_points[0].dx) / 2;
    yc = (p.dy + this.avg_points[0].dy) / 2;

    this.renderingContext.quadraticCurveTo(p.dx, p.dy, xc, yc);
    this.renderingContext.quadraticCurveTo(xc, yc, this.avg_points[0].dx, this.avg_points[0].dy);

    this.renderingContext.stroke();
    this.renderingContext.fill();
    this.renderingContext.restore();
    this.renderingContext.closePath();
  }

  drawWaveform() {

  }
}

class Star {
  constructor(index, width, height) {
    var w = width;
    var h = height;
    var cx = width / 2;
    var cy = height / 2;

    this.x = Math.random() * w - cx;
    this.y = Math.random() * h - cy;
    this.z = this.max_depth = Math.max(w / h);
    this.radius = 0.2;

    var xc = this.x > 0 ? 1 : -1;
    var yc = this.y > 0 ? 1 : -1;

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

    this.ddx = 0.001 * this.dx;
    this.ddy = 0.001 * this.dy;

    if (this.y > cy / 2) {
      this.color = stars_color_2;
    } else if (avg > AVG_BREAK_POINT + 10) {
      this.color = stars_color_2;
    } else if (avg > STARS_BREAK_POINT) {
      this.color = stars_color_3;
    } else {
      this.color = stars_color_1;
    }
  }
}

class Point {
  constructor(index, width, height) {
    this.index = index;
    this.width = width;
    this.height = height;

    this.angle = (this.index * 360) / TOTAL_POINTS;
    this.value = Math.random() * 256;
    this.dx = this.x + this.value * Math.sin(PI_HALF * this.angle);
    this.dy = this.y + this.value * Math.cos(PI_HALF * this.angle);

    this.updateDynamics();
  }

  updateDynamics() {
    this.radius = Math.abs(this.width, this.height) / 10;
    this.x = (this.width / 2) + this.radius * Math.sin(PI_HALF * this.angle);
    this.y = (this.height / 2) + this.radius * Math.cos(PI_HALF * this.angle);
  }
}

class AvgPoint {
  constructor(index, width, height) {
    this.index = index;
    this.width = width;
    this.height = height;

    this.angle = (this.index * 360) / TOTAL_AVG_POINTS;
    this.value = Math.random() * 256;
    this.dx = this.x + this.value * Math.sin(PI_HALF * this.angle);
    this.dy = this.y + this.value * Math.cos(PI_HALF * this.angle);

    this.updateDynamics();
  }

  updateDynamics() {
    this.radius = Math.abs(this.width, this.height) / 10;
    this.x = (this.width / 2) + this.radius * Math.sin(PI_HALF * this.angle);
    this.y = (this.height / 2) + this.radius * Math.cos(PI_HALF * this.angle);
  }
}

export default Visualization;
