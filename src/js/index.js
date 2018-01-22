import Visualization from "./Visualization.js";

const viz1 = new Visualization(document.getElementById("viz1"));
const viz2 = new Visualization(document.getElementById("viz2"));

viz1.load("ogg/new_year_dubstep_minimix.ogg");
viz2.load("ogg/new_year_dubstep_minimix.ogg");

document.getElementById("button").addEventListener("click", () => {
  viz1.load("ogg/new_year_dubstep_minimix.ogg");
  viz2.load("ogg/new_year_dubstep_minimix.ogg");
});
