import AudioVisualization from "./AudioVisualization.js";

customElements.define("audio-visualization", AudioVisualization);
adoptedLink.import.querySelectorAll("audio-visualization").forEach((element) => document.body.appendChild(element));
document.querySelectorAll("audio-visualization").forEach((element) => element.audioContext = new AudioContext());
