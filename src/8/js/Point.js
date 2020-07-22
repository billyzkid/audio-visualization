import * as Constants from "./Constants.js";

class Point {
  constructor(visualization, angle, value) {
    this.visualization = visualization;
    this.angle = angle;
    this.value = value;

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

export default Point;
