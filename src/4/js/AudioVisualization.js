import AudioPlayer from "./AudioPlayer.js";

// Only one per page!
const audioContext = new AudioContext();

class AudioVisualization extends HTMLElement {
  constructor() {
    super();
    console.log("AudioVisualization (ctor)");

    try {
      this.audioAnalyserNode = audioContext.createAnalyser();
      this.audioAnalyserNode.connect(audioContext.destination);

      this.audioElement = this.createAudioElement();
      this.audioSourceNode = audioContext.createMediaElementSource(this.audioElement);
      this.audioSourceNode.connect(this.audioAnalyserNode);

      this.letsDraw();

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

  static get dispatchedEvents() {
    return [
      "abort",
      "canplay",
      "canplaythrough",
      "durationchange",
      "emptied",
      "ended",
      "error",
      "loadeddata",
      "loadedmetadata",
      "loadstart",
      "pause",
      "play",
      "playing",
      "progress",
      "ratechange",
      "seeked",
      "seeking",
      "stalled",
      "suspend",
      "timeupdate",
      "volumechange",
      "waiting"
    ];
  }

  static get observedAttributes() {
    return [
      "autoplay",
      "controls",
      "loop",
      "muted",
      "preload",
      "src"
    ];
  }

  //#region Properties

  // audioTracks
  // buffered
  // crossOrigin
  // currentSrc
  // defaultPlaybackRate
  // mediaKeys
  // msAudioCategory
  // msAudioDeviceType
  // msGraphicsTrustStatus
  // msKeys
  // msPlayToDisabled
  // msPlayToPreferredSourceUri
  // msPlayToPrimary
  // msPlayToSource
  // msRealTime
  // networkState
  // playbackRate
  // played
  // readyState
  // seekable
  // srcObject
  // textTracks
  // videoTracks

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

  get currentTime() {
    console.log("AudioVisualization.currentTime (get)");

    return this.audioElement.currentTime;
  }

  set currentTime(value) {
    console.log("AudioVisualization.currentTime (set)", { value });

    this.audioElement.currentTime = value;
  }

  get defaultMuted() {
    console.log("AudioVisualization.defaultMuted (get)");

    return this.hasAttribute("muted");
  }

  set defaultMuted(value) {
    console.log("AudioVisualization.defaultMuted (set)", { value });

    if (value) {
      this.setAttribute("muted", "");
    } else {
      this.removeAttribute("muted");
    }
  }

  get duration() {
    console.log("AudioVisualization.duration (get)");

    return this.audioElement.duration;
  }

  get ended() {
    console.log("AudioVisualization.ended (get)");

    return this.audioElement.ended;
  }

  get error() {
    console.log("AudioVisualization.error (get)");

    return this.audioElement.error;
  }

  get loop() {
    console.log("AudioVisualization.loop (get)");

    return this.hasAttribute("loop");
  }

  set loop(value) {
    console.log("AudioVisualization.loop (set)", { value });

    if (value) {
      this.setAttribute("loop", "");
    } else {
      this.removeAttribute("loop");
    }
  }

  get muted() {
    console.log("AudioVisualization.muted (get)");

    return this.audioElement.muted;
  }

  set muted(value) {
    console.log("AudioVisualization.muted (set)", { value });

    this.audioElement.muted = value;
  }

  get paused() {
    console.log("AudioVisualization.paused (get)");

    return this.audioElement.paused;
  }

  get preload() {
    console.log("AudioVisualization.preload (get)");

    return this.getAttribute("preload");
  }

  set preload(value) {
    console.log("AudioVisualization.preload (set)", { value });

    this.setAttribute("preload", value);
  }

  get seeking() {
    console.log("AudioVisualization.seeking (get)");

    return this.audioElement.seeking;
  }

  get src() {
    console.log("AudioVisualization.src (get)");

    return this.getAttribute("src");
  }

  set src(value) {
    console.log("AudioVisualization.src (set)", { value });

    this.setAttribute("src", value);
  }

  get volume() {
    console.log("AudioVisualization.volume (get)");

    return this.audioElement.volume;
  }

  set volume(value) {
    console.log("AudioVisualization.volume (set)", { value });

    this.audioElement.volume = value;
  }

  //#endregion

  //#region Methods

  // addTextTrack
  // canPlayType
  // msClearEffects
  // msGetAsCastingSource
  // msInsertAudioEffect
  // msSetMediaKeys
  // msSetMediaProtectionManager
  // setMediaKeys
  // onencrypted
  // onmsneedkey

  load() {
    console.log("AudioVisualization.load");

    this.audioElement.load();
  }

  pause() {
    console.log("AudioVisualization.pause");

    this.audioElement.pause();
  }

  play() {
    console.log("AudioVisualization.play");

    this.audioElement.play();
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

  createAudioElement() {
    console.log("AudioVisualization.createAudioElement");

    const audioElement = document.createElement("audio");
    const audioEventHandler = (event) => this.handleEvent(event);

    AudioVisualization.dispatchedEvents.forEach((e) => {
      audioElement[`on${e}`] = audioEventHandler;
    });

    // TODO: Remove this
    audioElement.id = "myAudio";
    document.body.appendChild(audioElement);

    return audioElement;
  }

  handleEvent(event) {
    console.log("AudioVisualization.handleEvent", { event });

    this.dispatchEvent(new Event(event.type, event));
  }

  letsDraw() {
    console.log("AudioVisualization.letsDraw");

    // window.requestAnimationFrame(() => this.letsDraw());
    // fbc_array = new Uint8Array(analyser.frequencyBinCount);
    // analyser.getByteFrequencyData(fbc_array); //get frequency from the analyser node
    // ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ctx.fillStyle = "white";
    // ctx.font = "bold 12px Arial";
    // ctx.fillText("currently playing:" + trackName, 10, 20);//this works

    // bars = 150;
    // for (var i = 0; i < analyser.frequencyBinCount; i++) { //but this doesn't
    //   /*fill the canvas*/
    //   x = i * 2;
    //   barWidth = 1;
    //   barHeight = -(fbc_array[i] / 1.8);

    //   //colours react to the  frequency loudness
    //   hue = parseInt(500 * (1 - (barHeight / 200)), 10);
    //   ctx.fillStyle = 'hsl(' + hue + ',75%,50%)';

    //   ctx.fillRect(x, canvas.height, barWidth, barHeight);
    // }
  }

  //#endregion
}

export default AudioVisualization;
