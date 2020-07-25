import * as Constants from "./Constants.js";
import AudioVisualization from "./AudioVisualization.js";
import Star from "./Star.js";
import Point from "./Point.js";

customElements.define("audio-visualization", AudioVisualization);

const viz1 = document.getElementById("viz1");

viz1.addEventListener("paint", (e) => {
  const visualization = e.target;
  const canvas = visualization.canvasContext.canvas;
  const width = canvas.width = canvas.offsetWidth;
  const height = canvas.height = canvas.offsetHeight;

  clearCanvas(visualization, width, height);

  if (visualization.playing) {
    visualization.analyser.getByteFrequencyData(visualization.frequencyData);
    visualization.analyser.getByteTimeDomainData(visualization.timeData);

    const avg = visualization.frequencyData.reduce((a, b) => a + b) / visualization.frequencyData.length * visualization.gainNode.gain.value;

    drawStars(visualization, width, height, avg);
    drawCircle(visualization, width, height, avg);
    drawWave(visualization, width, height, avg);
  }
});

function clearCanvas(visualization, width, height) {
  const gradient = visualization.canvasContext.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, Constants.BG_GRADIENT_COLOR_1);
  gradient.addColorStop(0.96, Constants.BG_GRADIENT_COLOR_2);
  gradient.addColorStop(1, Constants.BG_GRADIENT_COLOR_3);

  visualization.canvasContext.fillStyle = gradient;
  visualization.canvasContext.globalCompositeOperation = "source-over";
  visualization.canvasContext.beginPath();
  visualization.canvasContext.fillRect(0, 0, width, height);
  visualization.canvasContext.fill();
  visualization.canvasContext.closePath();
}

function drawStars(visualization, width, height, avg) {
  const cx = width / 2;
  const cy = height / 2;

  if (!visualization.stars) {
    visualization.stars = [];

    for (var i = 0; i < Constants.TOTAL_STARS; i++) {
      visualization.stars.push(new Star(width, height, avg));
    }
  }

  for (var i = 0; i < visualization.stars.length; i++) {
    const star = visualization.stars[i];
    const tick = avg > Constants.AVG_BREAK_POINT ? avg / 20 : avg / 50;

    star.x += star.dx * tick;
    star.y += star.dy * tick;
    star.z += star.dz;
    star.dx += star.ddx;
    star.dy += star.ddy;
    star.radius = 0.2 + ((star.max_depth - star.z) * 0.1);

    if (star.x < -cx || star.x > cx || star.y < -cy || star.y > cy) {
      visualization.stars[i] = new Star(width, height, avg);
    } else {
      visualization.canvasContext.fillStyle = star.color;
      visualization.canvasContext.globalCompositeOperation = "lighter";
      visualization.canvasContext.beginPath();
      visualization.canvasContext.arc(star.x + cx, star.y + cy, star.radius, Math.PI * 2, false);
      visualization.canvasContext.fill();
      visualization.canvasContext.closePath();
    }
  }
}

function drawCircle(visualization, width, height, avg) {
  const cx = width / 2;
  const cy = height / 2;

  var avgValue = avg;
  var rotation = 0;
  var p, xc, yc;

  if (!visualization.circle_points) {
    visualization.circle_points = [];

    for (var i = 0; i < Constants.TOTAL_CIRCLE_POINTS; i++) {
      const angle = Math.PI * 2 * i / Constants.TOTAL_CIRCLE_POINTS;
      const randomValue = Math.random() * 256;
      visualization.circle_points.push(new Point(width, height, angle, randomValue));
    }
  }

  if (avg > Constants.CIRCLE_BREAK_POINT) {
    avgValue += Math.random() * 10;
    rotation += -Constants.CIRCLE_TICK;
    visualization.canvasContext.strokeStyle = Constants.CIRCLE_LINE_COLOR_2;
    visualization.canvasContext.fillStyle = Constants.CIRCLE_COLOR_2;
  } else {
    rotation += Constants.CIRCLE_TICK;
    visualization.canvasContext.strokeStyle = Constants.CIRCLE_LINE_COLOR_1;
    visualization.canvasContext.fillStyle = Constants.CIRCLE_COLOR_1;
  }

  visualization.canvasContext.beginPath();
  visualization.canvasContext.lineWidth = 1;
  visualization.canvasContext.lineCap = "round";

  visualization.canvasContext.save();
  visualization.canvasContext.translate(cx, cy);
  visualization.canvasContext.rotate(rotation);
  visualization.canvasContext.translate(-cx, -cy);
  visualization.canvasContext.moveTo(visualization.circle_points[0].dx, visualization.circle_points[0].dy);

  for (var i = 0; i < visualization.circle_points.length; i++) {
    p = visualization.circle_points[i];
    p.dx = p.x + avgValue * Math.sin(p.angle);
    p.dy = p.y + avgValue * Math.cos(p.angle);

    if (i + 1 < visualization.circle_points.length) {
      xc = (p.dx + visualization.circle_points[i + 1].dx) / 2;
      yc = (p.dy + visualization.circle_points[i + 1].dy) / 2;

      visualization.canvasContext.quadraticCurveTo(p.dx, p.dy, xc, yc);
    } else {
      xc = (p.dx + visualization.circle_points[0].dx) / 2;
      yc = (p.dy + visualization.circle_points[0].dy) / 2;

      visualization.canvasContext.quadraticCurveTo(p.dx, p.dy, xc, yc);
      visualization.canvasContext.quadraticCurveTo(xc, yc, visualization.circle_points[0].dx, visualization.circle_points[0].dy);
    }
  }

  visualization.canvasContext.stroke();
  visualization.canvasContext.fill();
  visualization.canvasContext.restore();
  visualization.canvasContext.closePath();
}

function drawWave(visualization, width, height, avg) {
  const cx = width / 2;
  const cy = height / 2;

  var rotation = 0;
  var p, xc, yc;

  if (!visualization.wave_points) {
    visualization.wave_points = [];

    for (var i = 0; i < Constants.TOTAL_WAVE_POINTS; i++) {
      const angle = Math.PI * 2 * i / Constants.TOTAL_WAVE_POINTS;
      const randomValue = Math.random() * 256;
      visualization.wave_points.push(new Point(width, height, angle, randomValue));
    }
  }

  if (avg > Constants.WAVE_BREAK_POINT) {
    rotation += Constants.WAVE_TICK;
    visualization.canvasContext.strokeStyle = Constants.WAVE_LINE_COLOR_2;
    visualization.canvasContext.fillStyle = Constants.WAVE_COLOR_2;
  } else {
    rotation += -Constants.WAVE_TICK;
    visualization.canvasContext.strokeStyle = Constants.WAVE_LINE_COLOR_1;
    visualization.canvasContext.fillStyle = Constants.WAVE_COLOR_1;
  }

  visualization.canvasContext.beginPath();
  visualization.canvasContext.lineWidth = 1;
  visualization.canvasContext.lineCap = "round";

  visualization.canvasContext.save();
  visualization.canvasContext.translate(cx, cy);
  visualization.canvasContext.rotate(rotation);
  visualization.canvasContext.translate(-cx, -cy);
  visualization.canvasContext.moveTo(visualization.wave_points[0].dx, visualization.wave_points[0].dy);

  for (var i = 0; i < visualization.wave_points.length; i++) {
    p = visualization.wave_points[i];
    p.dx = p.x + visualization.timeData[i] * Math.sin(p.angle);
    p.dy = p.y + visualization.timeData[i] * Math.cos(p.angle);

    if (i + 1 < visualization.wave_points.length) {
      xc = (p.dx + visualization.wave_points[i + 1].dx) / 2;
      yc = (p.dy + visualization.wave_points[i + 1].dy) / 2;

      visualization.canvasContext.quadraticCurveTo(p.dx, p.dy, xc, yc);
    } else {
      xc = (p.dx + visualization.wave_points[0].dx) / 2;
      yc = (p.dy + visualization.wave_points[0].dy) / 2;

      visualization.canvasContext.quadraticCurveTo(p.dx, p.dy, xc, yc);
      visualization.canvasContext.quadraticCurveTo(xc, yc, visualization.wave_points[0].dx, visualization.wave_points[0].dy);
    }
  }

  visualization.canvasContext.stroke();
  visualization.canvasContext.fill();
  visualization.canvasContext.restore();
  visualization.canvasContext.closePath();
}
