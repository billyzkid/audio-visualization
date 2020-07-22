import AudioVisualization from "./AudioVisualization.js";
import Visualization from "./Visualization.js";

customElements.define("audio-visualization", AudioVisualization);
//adoptedLink.import.querySelectorAll("audio-visualization").forEach((element) => document.body.appendChild(element));
document.querySelectorAll("audio-visualization").forEach((element) => element.audioContext = new AudioContext());

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
