let audioContext;

class AudioVisualization extends HTMLElement {
  constructor() {
    super();
    this._trace("constructor");

    try {
      this._initializeShadowRoot();
      this._initializeAudioContext();
      this._initializeRenderingContext();
    } catch (error) {
      console.error(error);
    }
  }

  _trace(method, args) {
    console.log(`${this.id || "(unknown)"}.${method}`, args);
  }

  _initializeShadowRoot() {
    this._trace("_initializeShadowRoot");

    this.attachShadow({ mode: "open" });

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          width: 300px;
          height: 150px;
        }

        div {
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: center;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        span {
          display: flex;
        }

        canvas {
          flex: 1;
          width: 100%;
          min-height: 0;
        }

        audio {
          width: 100%;
          order: 1;
        }
      </style>
      <div>
        <canvas></canvas>
        <audio controls></audio>
      </div>
      <span></span>`;
  }

  _initializeAudioContext() {
    this._trace("_initializeAudioContext");

    if (!audioContext) {
      audioContext = new AudioContext();
    }

    this._audioContext = audioContext;
  }

  _initializeRenderingContext() {
    this._trace("_initializeRenderingContext");

    const canvasElement = this.shadowRoot.querySelector("canvas");
    this._renderingContext = canvasElement.getContext("2d");
  }

  _beginRendering() {
    this._trace("_beginRendering");

    //this._renderingRequestId = requestAnimationFrame(() => this._beginRendering());
  }

  _cancelRendering() {
    this._trace("_cancelRendering");

    cancelAnimationFrame(this._renderingRequestId);
  }

  connectedCallback() {
    this._trace("connectedCallback");

    this._beginRendering();
  }

  disconnectedCallback() {
    this._trace("disconnectedCallback");

    this._cancelRendering();
  }

  adoptedCallback() {
    this._trace("adoptedCallback");
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this._trace("attributeChangedCallback", { name, oldValue, newValue });
  }
}

export default AudioVisualization;
