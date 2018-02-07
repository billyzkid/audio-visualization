const template = document.createElement("template");

template.innerHTML = `
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

    audio {
      flex: none;
      width: 100%;
      order: 1;
    }

    canvas {
      flex: auto;
      width: 100%;
      min-height: 0;
    }
  </style>
  <div>
    <audio controls></audio>
    <canvas></canvas>
  </div>
  <span></span>
`;

class AudioVisualization extends HTMLElement {
  constructor() {
    super();

    console.log(`${this.id || "(unknown)"}.constructor`);

    try {
      const shadowNode = template.content.cloneNode(true);

      // Initialize audio
      const audioElement = shadowNode.querySelector("audio");
      const audioContext = new AudioContext();
      const audioSourceNode = audioContext.createMediaElementSource(audioElement);
      const audioGainNode = audioContext.createGain();
      const audioAnalyserNode = audioContext.createAnalyser();
      const audioDestinationNode = audioSourceNode.connect(audioGainNode).connect(audioAnalyserNode).connect(audioContext.destination);

      // Initialize canvas
      const canvasElement = shadowNode.querySelector("canvas");
      const canvasContext = canvasElement.getContext("2d");

      this._animationCallback = () => {
        this._requestAnimation();
        this.paint();
      };

      this.attachShadow({ mode: "closed" }).appendChild(shadowNode);
    } catch (error) {
      console.error(error);
    }
  }

  _requestAnimation() {
    console.log(`${this.id || "(unknown)"}._requestAnimation`);

    this._animationRequestId = requestAnimationFrame(this._animationCallback);
  }

  _cancelAnimation() {
    console.log(`${this.id || "(unknown)"}._cancelAnimation`);

    cancelAnimationFrame(this._animationRequestId);
  }

  connectedCallback() {
    console.log(`${this.id || "(unknown)"}.connectedCallback`);

    //this._requestAnimation();
  }

  disconnectedCallback() {
    console.log(`${this.id || "(unknown)"}.disconnectedCallback`);

    this._cancelAnimation();
  }

  adoptedCallback() {
    console.log(`${this.id || "(unknown)"}.adoptedCallback`);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log(`${this.id || "(unknown)"}.attributeChangedCallback`, { name, oldValue, newValue });
  }

  paint() {
    console.log(`${this.id || "(unknown)"}.paint`);
  }
}

export default AudioVisualization;
