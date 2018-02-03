import AudioPlayer from "./AudioPlayer.js";

class AudioVisualization extends HTMLElement {
  constructor() {
    super();
    console.log("AudioVisualization (ctor)");

    try {
      this.audioElement = document.createElement("audio");
      this.audioElement.id = "myAudio";
      document.body.appendChild(this.audioElement);

      //this.audioPlayer = new AudioPlayer();

      const shadowRoot = this.attachShadow({ mode: "open" });
      shadowRoot.innerHTML = `
        <style>
          :host {
            width: 300px;
            height: 150px;
          }
          canvas {
            background-color: #000;
          }
        </style>
        <canvas></canvas>
        <!-- <slot></slot> -->
      `;
    } catch (error) {
      console.error(error);
    }
  }

  static get observedAttributes() {
    return [
      "autoplay",
      "controls",
      "src"
    ];
  }

  get autoplay() {
    console.log("AudioVisualization.autoplay (get)");

    return this.hasAttribute("autoplay");
  }

  set autoplay(value) {
    console.log("AudioVisualization.autoplay (set)", { value });

    if (value) {
      this.setAttribute("autoplay", "");
    } else {
      this.removeAttribute("autoplay");
    }
  }

  get controls() {
    console.log("AudioVisualization.controls (get)");

    return this.hasAttribute("controls");
  }

  set controls(value) {
    console.log("AudioVisualization.controls (set)", { value });

    if (value) {
      this.setAttribute("controls", "");
    } else {
      this.removeAttribute("controls");
    }
  }

  get src() {
    console.log("AudioVisualization.src (get)");

    return this.getAttribute("src");
  }

  set src(value) {
    console.log("AudioVisualization.src (set)", { value });

    this.setAttribute("src", value);
  }

  connectedCallback() {
    console.log("AudioVisualization.connectedCallback");
  }

  disconnectedCallback() {
    console.log("AudioVisualization.disconnectedCallback");
  }

  adoptedCallback() {
    console.log("AudioVisualization.adoptedCallback");
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log("AudioVisualization.attributeChangedCallback", { name, oldValue, newValue });

    if (newValue !== null) {
      this.audioElement.setAttribute(name, newValue);
    } else {
      this.audioElement.removeAttribute(name);
    }
  }
}

export default AudioVisualization;
