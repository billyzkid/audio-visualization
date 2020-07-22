import * as Constants from "./Constants.js";

class AvgPoint {
  constructor(visualization, index) {
    this.visualization = visualization;
    this.angle = (index * 360) / Constants.TOTAL_AVG_POINTS;
    this.value = Math.random() * 256;

    this.update();
  }

  update() {
    const width = this.visualization.element.offsetWidth;
    const height = this.visualization.element.offsetHeight;

    this.radius = Math.abs(width, height) / 10;
    this.x = (width / 2) + this.radius * Math.sin(Constants.PI_HALF * this.angle);
    this.y = (height / 2) + this.radius * Math.cos(Constants.PI_HALF * this.angle);
    this.dx = this.x + this.value * Math.sin(Constants.PI_HALF * this.angle);
    this.dy = this.y + this.value * Math.cos(Constants.PI_HALF * this.angle);
  }
}

export default AvgPoint;
