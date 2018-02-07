import AudioVisualization from "./AudioVisualization.js";

if (window.customElements) {
  window.customElements.define("audio-visualization", AudioVisualization);
}

if (window.adoptedLink) {
  const adoptedChildren = adoptedLink.import.querySelectorAll("audio-visualization");
  adoptedChildren.forEach((child) => document.body.appendChild(child));
}
