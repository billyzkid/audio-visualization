// const myVideo = document.createElement("video");
// myVideo.id = "myVideo";
// myVideo.src = "/audio/new_year_dubstep_minimix.ogg";
// myVideo.autoplay = false;
// myVideo.controls = true;
// document.body.appendChild(myVideo);

// const myAudio = document.createElement("audio");
// myAudio.id = "myAudio";
// myAudio.src = "/audio/new_year_dubstep_minimix.ogg";
// myAudio.autoplay = false;
// myAudio.controls = true;
// document.body.appendChild(myAudio);

// const myAudioVisualization = document.createElement("audio-visualization");
// myAudioVisualization.id = "myAudioVisualization";
// myAudioVisualization.src = "/audio/new_year_dubstep_minimix.ogg";
// myAudioVisualization.autoplay = false;
// myAudioVisualization.controls = true;
// document.body.appendChild(myAudioVisualization);

// const myDiv = document.createElement("div");
// myDiv.textContent = "Hello, World!";
// document.body.appendChild(myDiv);

// const myShadowRoot = myDiv.attachShadow({ mode: "open" });
// myShadowRoot.textContent = "Hello, Treehouse!";

class AudioVisualizationHTMLElement extends HTMLElement {
  constructor() {
    super();
    console.log("AudioVisualizationHTMLElement");

    try {
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
    return this.hasAttribute("src");
  }

  set src(value) {
    if (value) {
      this.setAttribute("src", value);
    } else {
      this.removeAttribute("src");
    }
  }

  get autoplay() {
    return this.hasAttribute("autoplay");
  }

  set autoplay(value) {
    if (value) {
      this.setAttribute("autoplay", "");
    } else {
      this.removeAttribute("autoplay");
    }
  }

  get controls() {
    return this.hasAttribute("controls");
  }

  set controls(value) {
    if (value) {
      this.setAttribute("controls", "");
    } else {
      this.removeAttribute("controls");
    }
  }

  connectedCallback() {
    console.log("AudioVisualizationHTMLElement.connectedCallback");
  }

  disconnectedCallback() {
    console.log("AudioVisualizationHTMLElement.disconnectedCallback");
  }

  adoptedCallback() {
    console.log("AudioVisualizationHTMLElement.adoptedCallback");
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log("AudioVisualizationHTMLElement.attributeChangedCallback", { name, oldValue, newValue });
  }
}

customElements.define("audio-visualization", AudioVisualizationHTMLElement);
