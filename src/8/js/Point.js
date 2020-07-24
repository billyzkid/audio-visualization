import * as Constants from "./Constants.js";

class Point {
  constructor(width, height, angle) {
    const randomValue = Math.random() * Constants.RANDOM_POINT_VALUE;

    this.radius = Math.abs(width, height) / 10;
    this.x = (width / 2) + this.radius * Math.sin(Constants.PI_HALF * angle);
    this.y = (height / 2) + this.radius * Math.cos(Constants.PI_HALF * angle);
    this.dx = this.x + randomValue * Math.sin(Constants.PI_HALF * angle);
    this.dy = this.y + randomValue * Math.cos(Constants.PI_HALF * angle);
  }
}

export default Point;
