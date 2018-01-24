import Visualization from "./Visualization.js";

const viz1 = new Visualization(document.getElementById("viz1"));
const viz2 = new Visualization(document.getElementById("viz2"));

document.getElementById("button1").addEventListener("click", () => {
  viz1.load("oggy/new_year_dubstep_minimix.ogg");
  viz2.load("ogg/new_year_dubstep_minimix.ogg");
});

document.getElementById("button2").addEventListener("click", () => {
  viz1.reload();
  viz2.reload();
});

document.getElementById("button3").addEventListener("click", () => {
  location.reload(true);
});
