import * as Constants from "./Constants.js";
import AudioVisualization from "./AudioVisualization.js";
import Star from "./Star.js";
import Point from "./Point.js";

customElements.define("audio-visualization", AudioVisualization);

const viz1 = document.getElementById("viz1");
const stars = [];
const points = [];
const avg_points = [];

viz1.addEventListener("paint", () => {
  console.log("Paint!");

  const width = viz1.canvasContext.canvas.offsetWidth;
  const height = viz1.canvasContext.canvas.offsetHeight;

  viz1.canvasContext.canvas.width = width;
  viz1.canvasContext.canvas.height = height;

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

  if (viz1.playing) {
    viz1.analyser.getByteFrequencyData(viz1.frequencyData);
    viz1.analyser.getByteTimeDomainData(viz1.timeData);

    const avg = viz1.frequencyData.reduce((a, b) => a + b) / viz1.frequencyData.length * viz1.gainNode.gain.value;
    const cx = width / 2;
    const cy = height / 2;

    if (!stars.length) {
      for (var i = 0; i < Constants.TOTAL_STARS; i++) {
        stars.push(new Star(width, height, avg));
      }
    }

    if (!points.length) {
      for (var i = 0; i < Constants.TOTAL_POINTS; i++) {
        const angle = (i * 360) / Constants.TOTAL_POINTS;
        points.push(new Point(width, height, angle));
      }
    }

    if (!avg_points.length) {
      for (var i = 0; i < Constants.TOTAL_AVG_POINTS; i++) {
        const angle = (i * 360) / Constants.TOTAL_AVG_POINTS;
        avg_points.push(new Point(width, height, angle));
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
        viz1.canvasContext.arc(star.x + cx, star.y + cy, star.radius, Constants.PI_TWO, false);
        viz1.canvasContext.fill();
        viz1.canvasContext.closePath();
      }
    }

    /*************/

    var rotation = 0;
    var randomValue = avg;
    var p, xc, yc;

    if (avg > Constants.AVG_BREAK_POINT) {
      randomValue += Math.random() * 10;
      rotation += -Constants.BUBBLE_AVG_TICK;
      viz1.canvasContext.strokeStyle = Constants.BUBBLE_AVG_LINE_COLOR_2;
      viz1.canvasContext.fillStyle = Constants.BUBBLE_AVG_COLOR_2;
    } else {
      rotation += Constants.BUBBLE_AVG_TICK;
      viz1.canvasContext.strokeStyle = Constants.BUBBLE_AVG_LINE_COLOR_1;
      viz1.canvasContext.fillStyle = Constants.BUBBLE_AVG_COLOR_1;
    }

    viz1.canvasContext.beginPath();
    viz1.canvasContext.lineWidth = 1;
    viz1.canvasContext.lineCap = "round";

    viz1.canvasContext.save();
    viz1.canvasContext.translate(cx, cy);
    viz1.canvasContext.rotate(rotation);
    viz1.canvasContext.translate(-cx, -cy);
    viz1.canvasContext.moveTo(avg_points[0].dx, avg_points[0].dy);

    for (var i = 0; i < avg_points.length - 1; i++) {
      p = avg_points[i];
      p.dx = p.x + randomValue * Math.sin(Constants.PI_HALF * p.angle);
      p.dy = p.y + randomValue * Math.cos(Constants.PI_HALF * p.angle);

      xc = (p.dx + avg_points[i + 1].dx) / 2;
      yc = (p.dy + avg_points[i + 1].dy) / 2;

      viz1.canvasContext.quadraticCurveTo(p.dx, p.dy, xc, yc);
    }

    p = avg_points[i];
    p.dx = p.x + randomValue * Math.sin(Constants.PI_HALF * p.angle);
    p.dy = p.y + randomValue * Math.cos(Constants.PI_HALF * p.angle);

    xc = (p.dx + avg_points[0].dx) / 2;
    yc = (p.dy + avg_points[0].dy) / 2;

    viz1.canvasContext.quadraticCurveTo(p.dx, p.dy, xc, yc);
    viz1.canvasContext.quadraticCurveTo(xc, yc, avg_points[0].dx, avg_points[0].dy);

    viz1.canvasContext.stroke();
    viz1.canvasContext.fill();
    viz1.canvasContext.restore();
    viz1.canvasContext.closePath();

    /*************/

    rotation = 0;

    if (avg > Constants.AVG_BREAK_POINT) {
      rotation += Constants.WAVEFORM_TICK;
      viz1.canvasContext.strokeStyle = Constants.WAVEFORM_LINE_COLOR_2;
      viz1.canvasContext.fillStyle = Constants.WAVEFORM_COLOR_2;
    } else {
      rotation += -Constants.WAVEFORM_TICK;
      viz1.canvasContext.strokeStyle = Constants.WAVEFORM_LINE_COLOR_1;
      viz1.canvasContext.fillStyle = Constants.WAVEFORM_COLOR_1;
    }

    viz1.canvasContext.beginPath();
    viz1.canvasContext.lineWidth = 1;
    viz1.canvasContext.lineCap = "round";

    viz1.canvasContext.save();
    viz1.canvasContext.translate(cx, cy);
    viz1.canvasContext.rotate(rotation)
    viz1.canvasContext.translate(-cx, -cy);
    viz1.canvasContext.moveTo(points[0].dx, points[0].dy);

    for (var i = 0; i < points.length - 1; i++) {
      p = points[i];
      p.dx = p.x + viz1.timeData[i] * Math.sin(Constants.PI_HALF * p.angle);
      p.dy = p.y + viz1.timeData[i] * Math.cos(Constants.PI_HALF * p.angle);

      xc = (p.dx + points[i + 1].dx) / 2;
      yc = (p.dy + points[i + 1].dy) / 2;

      viz1.canvasContext.quadraticCurveTo(p.dx, p.dy, xc, yc);
    }

    p = points[i];
    p.dx = p.x + viz1.timeData[i] * Math.sin(Constants.PI_HALF * p.angle);
    p.dy = p.y + viz1.timeData[i] * Math.cos(Constants.PI_HALF * p.angle);

    xc = (p.dx + points[0].dx) / 2;
    yc = (p.dy + points[0].dy) / 2;

    viz1.canvasContext.quadraticCurveTo(p.dx, p.dy, xc, yc);
    viz1.canvasContext.quadraticCurveTo(xc, yc, points[0].dx, points[0].dy);

    viz1.canvasContext.stroke();
    viz1.canvasContext.fill();
    viz1.canvasContext.restore();
    viz1.canvasContext.closePath();
  }
});
