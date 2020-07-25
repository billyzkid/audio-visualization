import * as Constants from "./Constants.js";

class Point {
  constructor(width, height, angle, randomValue) {
    this.angle = angle;
    this.radius = Math.abs(width, height) / 10;
    this.x = (width / 2) + this.radius * Math.sin(angle);
    this.y = (height / 2) + this.radius * Math.cos(angle);
    this.dx = this.x + randomValue * Math.sin(angle);
    this.dy = this.y + randomValue * Math.cos(angle);
  }
}

export default Point;
