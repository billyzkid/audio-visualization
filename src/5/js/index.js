import AudioVisualization from "./AudioVisualization.js";

customElements.define("audio-visualization", AudioVisualization);

const adoptedChildren = adoptedLink.import.querySelectorAll("audio-visualization");
adoptedChildren.forEach((child) => document.body.appendChild(child));
