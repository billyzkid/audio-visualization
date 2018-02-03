import AudioPlayer from "./AudioPlayer.js";

class AudioVisualization extends HTMLElement {
  constructor() {
    super();
    console.log("AudioVisualization (ctor)");

    try {
      const audioPlayer = new AudioPlayer();
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
    return ["src", "autoplay", "controls"];
  }

  get src() {
    console.log("AudioVisualization.src (get)");

    return this.getAttribute("src");
  }

  set src(value) {
    console.log("AudioVisualization.src (set)", { value });

    if (value) {
      this.setAttribute("src", value);
    } else {
      this.removeAttribute("src");
    }
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
  }
}

export default AudioVisualization;
