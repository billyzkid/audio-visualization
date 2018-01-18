import Visualization from "./Visualization.js";

const viz1 = new Visualization("viz1");
const viz2 = new Visualization("viz2");

window.addEventListener("load", () => {
  viz1.initialize();
  viz2.initialize();
});

window.addEventListener("resize", () => {
  viz1.resize();
  viz2.resize();
});
