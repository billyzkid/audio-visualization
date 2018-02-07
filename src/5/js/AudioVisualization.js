let audioContext;

class AudioVisualization extends HTMLElement {
  constructor() {
    super();

    console.log(`${this.id || "(unknown)"}.constructor`);

    try {
      this._initializeShadowRoot();
      this._initializeAudioContext();
      this._initializeRenderingContext();
    } catch (error) {
      console.error(error);
    }
  }

  _initializeShadowRoot() {
    console.log(`${this.id || "(unknown)"}._initializeShadowRoot`);

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
    console.log(`${this.id || "(unknown)"}._initializeAudioContext`);

    if (!audioContext) {
      audioContext = new AudioContext();
    }

    this._audioContext = audioContext;
  }

  _initializeRenderingContext() {
    console.log(`${this.id || "(unknown)"}._initializeRenderingContext`);

    const canvasElement = this.shadowRoot.querySelector("canvas");
    this._renderingContext = canvasElement.getContext("2d");
  }

  _beginRendering() {
    console.log(`${this.id || "(unknown)"}._beginRendering`);

    //this._renderingRequestId = requestAnimationFrame(() => this._beginRendering());
  }

  _cancelRendering() {
    console.log(`${this.id || "(unknown)"}._cancelRendering`);

    cancelAnimationFrame(this._renderingRequestId);
  }

  connectedCallback() {
    console.log(`${this.id || "(unknown)"}.connectedCallback`);

    this._beginRendering();
  }

  disconnectedCallback() {
    console.log(`${this.id || "(unknown)"}.disconnectedCallback`);

    this._cancelRendering();
  }

  adoptedCallback() {
    console.log(`${this.id || "(unknown)"}.adoptedCallback`);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log(`${this.id || "(unknown)"}.attributeChangedCallback`, { name, oldValue, newValue });
  }
}

export default AudioVisualization;
