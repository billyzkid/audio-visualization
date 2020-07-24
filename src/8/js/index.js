import * as Constants from "./Constants.js";
import AudioVisualization from "./AudioVisualization.js";
import Star from "./Star.js";
//import Point from "./Point.js";

customElements.define("audio-visualization", AudioVisualization);

const viz1 = document.getElementById("viz1");
const stars = [];
const points = [];
const avg_points = [];

viz1.addEventListener("paint", () => {
  console.log("Paint!");

  const width = viz1.canvasContext.canvas.offsetWidth;
  const height = viz1.canvasContext.canvas.offsetHeight;

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

    // for (var i = 0; i < Constants.TOTAL_STARS; i++) {
    //   const star = stars[i] = new Star(width, height, avg);

    //   viz1.canvasContext.fillStyle = star.color;
    //   viz1.canvasContext.globalCompositeOperation = "lighter";
    //   viz1.canvasContext.beginPath();
    //   viz1.canvasContext.arc(star.x, star.y, star.radius, Constants.PI_TWO, false);
    //   viz1.canvasContext.fill();
    //   viz1.canvasContext.closePath();
    // }

    if (!stars.length) {
      for (var i = 0; i < Constants.TOTAL_STARS; i++) {
        stars.push(new Star(width, height, avg));
      }
    }

    for (var i = 0; i < stars.length; i++) {
      const star = stars[i];
      const tick = (avg > Constants.AVG_BREAK_POINT) ? (avg / 20) : (avg / 50);

      star.x += star.dx * tick;
      star.y += star.dy * tick;
      star.z += star.dz;
      star.dx += star.ddx;
      star.dy += star.ddy;
      star.radius = 0.2 + ((star.max_depth - star.z) * 0.1);

      if (star.x < -cx || star.x > cx || star.y < -cy || star.y > cy) {
        stars[i] = new Star(width, height, avg);
        continue;
      }

      viz1.canvasContext.fillStyle = star.color;
      viz1.canvasContext.globalCompositeOperation = "lighter";
      viz1.canvasContext.beginPath();
      viz1.canvasContext.arc(star.x + cx, star.y + cy, star.radius, Constants.PI_TWO, false);
      viz1.canvasContext.fill();
      viz1.canvasContext.closePath();
    }
  }
});
