import Visualization from "./Visualization.js";

const viz1 = new Visualization(document.getElementById("viz1"));

document.getElementById("button1").addEventListener("click", () => {
  viz1.load("/content/audio/new_year_dubstep_minimix.ogg");
});

document.getElementById("button2").addEventListener("click", () => {
  viz1.reload();
});

document.getElementById("button3").addEventListener("click", () => {
  location.reload(true);
});
