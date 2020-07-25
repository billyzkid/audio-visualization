import * as Constants from "./Constants.js";

class Star {
  constructor(width, height, avg) {
    this.x = Math.random() * width - (width / 2);
    this.y = Math.random() * height - (height / 2);
    this.z = this.max_depth = Math.max(width / height);
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

    if (this.y > height / 4) {
      this.color = Constants.STARS_COLOR_2;
    } else if (avg > Constants.AVG_BREAK_POINT + 10) {
      this.color = Constants.STARS_COLOR_2;
    } else if (avg > Constants.STARS_BREAK_POINT) {
      this.color = Constants.STARS_COLOR_3;
    } else {
      this.color = Constants.STARS_COLOR_1;
    }
  }
}

export default Star;
