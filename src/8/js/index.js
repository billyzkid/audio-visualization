import AudioVisualization from "./AudioVisualization.js";
import Visualization from "./Visualization.js";

// Define the custom <audio-visualization /> element
customElements.define("audio-visualization", AudioVisualization);

// Assign an AudioContext to each element
document.querySelectorAll("audio-visualization").forEach((element) => element.audioContext = new AudioContext());
