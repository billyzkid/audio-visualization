import * as Constants from "./Constants.js";
import AudioVisualization from "./AudioVisualization.js";
import Star from "./Star.js";
import Point from "./Point.js";

customElements.define("audio-visualization", AudioVisualization);

const viz1 = document.getElementById("viz1");
const stars = [];
const circle_points = [];
const wave_points = [];

viz1.addEventListener("paint", () => {
  const canvas = viz1.canvasContext.canvas;
  const width = canvas.width = canvas.offsetWidth;
  const height = canvas.height = canvas.offsetHeight;

  clearCanvas(width, height);

  if (viz1.playing) {
    viz1.analyser.getByteFrequencyData(viz1.frequencyData);
    viz1.analyser.getByteTimeDomainData(viz1.timeData);

    const avg = viz1.frequencyData.reduce((a, b) => a + b) / viz1.frequencyData.length * viz1.gainNode.gain.value;

    drawStars(width, height, avg);
    drawCircle(width, height, avg);
    drawWave(width, height, avg);
  }
});

function clearCanvas(width, height) {
  const gradient = viz1.canvasContext.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, Constants.BG_GRADIENT_COLOR_1);
  gradient.addColorStop(0.96, Constants.BG_GRADIENT_COLOR_2);
  gradient.addColorStop(1, Constants.BG_GRADIENT_COLOR_3);

  viz1.canvasContext.fillStyle = gradient;
  viz1.canvasContext.globalCompositeOperation = "source-over";
  viz1.canvasContext.beginPath();
  viz1.canvasContext.fillRect(0, 0, width, height);
  viz1.canvasContext.fill();
  viz1.canvasContext.closePath();
}

function drawStars(width, height, avg) {
  const cx = width / 2;
  const cy = height / 2;

  if (!stars.length) {
    for (var i = 0; i < Constants.TOTAL_STARS; i++) {
      stars.push(new Star(width, height, avg));
    }
  }

  for (var i = 0; i < stars.length; i++) {
    const star = stars[i];
    const tick = avg > Constants.AVG_BREAK_POINT ? avg / 20 : avg / 50;

    star.x += star.dx * tick;
    star.y += star.dy * tick;
    star.z += star.dz;
    star.dx += star.ddx;
    star.dy += star.ddy;
    star.radius = 0.2 + ((star.max_depth - star.z) * 0.1);

    if (star.x < -cx || star.x > cx || star.y < -cy || star.y > cy) {
      stars[i] = new Star(width, height, avg);
    } else {
      viz1.canvasContext.fillStyle = star.color;
      viz1.canvasContext.globalCompositeOperation = "lighter";
      viz1.canvasContext.beginPath();
      viz1.canvasContext.arc(star.x + cx, star.y + cy, star.radius, Math.PI * 2, false);
      viz1.canvasContext.fill();
      viz1.canvasContext.closePath();
    }
  }
}

function drawCircle(width, height, avg) {
  const cx = width / 2;
  const cy = height / 2;

  var avgValue = avg;
  var rotation = 0;
  var p, xc, yc;

  if (!circle_points.length) {
    for (var i = 0; i < Constants.TOTAL_CIRCLE_POINTS; i++) {
      const angle = Math.PI * 2 * i / Constants.TOTAL_CIRCLE_POINTS;
      const randomValue = Math.random() * 256;
      circle_points.push(new Point(width, height, angle, randomValue));
    }
  }

  if (avg > Constants.CIRCLE_BREAK_POINT) {
    avgValue += Math.random() * 10;
    rotation += -Constants.CIRCLE_TICK;
    viz1.canvasContext.strokeStyle = Constants.CIRCLE_LINE_COLOR_2;
    viz1.canvasContext.fillStyle = Constants.CIRCLE_COLOR_2;
  } else {
    rotation += Constants.CIRCLE_TICK;
    viz1.canvasContext.strokeStyle = Constants.CIRCLE_LINE_COLOR_1;
    viz1.canvasContext.fillStyle = Constants.CIRCLE_COLOR_1;
  }

  viz1.canvasContext.beginPath();
  viz1.canvasContext.lineWidth = 1;
  viz1.canvasContext.lineCap = "round";

  viz1.canvasContext.save();
  viz1.canvasContext.translate(cx, cy);
  viz1.canvasContext.rotate(rotation);
  viz1.canvasContext.translate(-cx, -cy);
  viz1.canvasContext.moveTo(circle_points[0].dx, circle_points[0].dy);

  for (var i = 0; i < circle_points.length; i++) {
    p = circle_points[i];
    p.dx = p.x + avgValue * Math.sin(p.angle);
    p.dy = p.y + avgValue * Math.cos(p.angle);

    if (i + 1 < circle_points.length) {
      xc = (p.dx + circle_points[i + 1].dx) / 2;
      yc = (p.dy + circle_points[i + 1].dy) / 2;

      viz1.canvasContext.quadraticCurveTo(p.dx, p.dy, xc, yc);
    } else {
      xc = (p.dx + circle_points[0].dx) / 2;
      yc = (p.dy + circle_points[0].dy) / 2;

      viz1.canvasContext.quadraticCurveTo(p.dx, p.dy, xc, yc);
      viz1.canvasContext.quadraticCurveTo(xc, yc, circle_points[0].dx, circle_points[0].dy);
    }
  }

  viz1.canvasContext.stroke();
  viz1.canvasContext.fill();
  viz1.canvasContext.restore();
  viz1.canvasContext.closePath();
}

function drawWave(width, height, avg) {
  const cx = width / 2;
  const cy = height / 2;

  var rotation = 0;
  var p, xc, yc;

  if (!wave_points.length) {
    for (var i = 0; i < Constants.TOTAL_WAVE_POINTS; i++) {
      const angle = Math.PI * 2 * i / Constants.TOTAL_WAVE_POINTS;
      const randomValue = Math.random() * 256;
      wave_points.push(new Point(width, height, angle, randomValue));
    }
  }

  if (avg > Constants.WAVE_BREAK_POINT) {
    rotation += Constants.WAVE_TICK;
    viz1.canvasContext.strokeStyle = Constants.WAVE_LINE_COLOR_2;
    viz1.canvasContext.fillStyle = Constants.WAVE_COLOR_2;
  } else {
    rotation += -Constants.WAVE_TICK;
    viz1.canvasContext.strokeStyle = Constants.WAVE_LINE_COLOR_1;
    viz1.canvasContext.fillStyle = Constants.WAVE_COLOR_1;
  }

  viz1.canvasContext.beginPath();
  viz1.canvasContext.lineWidth = 1;
  viz1.canvasContext.lineCap = "round";

  viz1.canvasContext.save();
  viz1.canvasContext.translate(cx, cy);
  viz1.canvasContext.rotate(rotation);
  viz1.canvasContext.translate(-cx, -cy);
  viz1.canvasContext.moveTo(wave_points[0].dx, wave_points[0].dy);

  for (var i = 0; i < wave_points.length; i++) {
    p = wave_points[i];
    p.dx = p.x + viz1.timeData[i] * Math.sin(p.angle);
    p.dy = p.y + viz1.timeData[i] * Math.cos(p.angle);

    if (i + 1 < wave_points.length) {
      xc = (p.dx + wave_points[i + 1].dx) / 2;
      yc = (p.dy + wave_points[i + 1].dy) / 2;

      viz1.canvasContext.quadraticCurveTo(p.dx, p.dy, xc, yc);
    } else {
      xc = (p.dx + wave_points[0].dx) / 2;
      yc = (p.dy + wave_points[0].dy) / 2;

      viz1.canvasContext.quadraticCurveTo(p.dx, p.dy, xc, yc);
      viz1.canvasContext.quadraticCurveTo(xc, yc, wave_points[0].dx, wave_points[0].dy);
    }
  }

  viz1.canvasContext.stroke();
  viz1.canvasContext.fill();
  viz1.canvasContext.restore();
  viz1.canvasContext.closePath();
}
