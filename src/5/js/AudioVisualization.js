let audioContext;

class AudioVisualization extends HTMLElement {
  constructor() {
    super();
    console.log("AudioVisualization (ctor)");

    try {
      this._initializeShadowRoot();
      this._initializeAudioContext();
      this._initializeRenderingContext();
    } catch (error) {
      console.error(error);
    }
  }

  _initializeShadowRoot() {
    console.log("AudioVisualization._initializeShadowRoot");

    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          width: 300px;
          height: 150px;
          vertical-align: top;
          background-color: #000;
        }
        div {
          width: inherit;
          height: inherit;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: center;
        }
        canvas {
          min-height: 0;
          width: 100%;
          flex: 1 1 0%;
          overflow: hidden;
        }
        audio {
          width: 100%;
          height: 32px;
          flex-shrink: 0;
        }
      </style>
      <div>
        <canvas></canvas>
        <audio controls></audio>
      </div>
    `;
  }

  _initializeAudioContext() {
    console.log("AudioVisualization._initializeAudioContext");

    if (!audioContext) {
      audioContext = new AudioContext();
    }

    this._audioContext = audioContext;
  }

  _initializeRenderingContext() {
    console.log("AudioVisualization._initializeRenderingContext");

    const canvasElement = this.shadowRoot.querySelector("canvas");
    this._renderingContext = canvasElement.getContext("2d");
  }

  _beginRendering() {
    console.log("AudioVisualization._beginRendering");

    this._renderingRequestId = window.requestAnimationFrame(() => this._beginRendering());
  }

  _cancelRendering() {
    console.log("AudioVisualization._cancelRendering");

    window.cancelAnimationFrame(this._renderingRequestId);
  }

  connectedCallback() {
    console.log("AudioVisualization.connectedCallback");

    this._beginRendering();
  }

  disconnectedCallback() {
    console.log("AudioVisualization.disconnectedCallback");

    this._cancelRendering();
  }

  adoptedCallback() {
    console.log("AudioVisualization.adoptedCallback");
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log("AudioVisualization.attributeChangedCallback", { name, oldValue, newValue });
  }
}

export default AudioVisualization;
