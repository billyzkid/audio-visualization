import AudioPlayer from "./AudioPlayer.js";

class AudioVisualization extends HTMLElement {
  constructor() {
    super();
    console.log("AudioVisualization (ctor)");

    try {
      this.audioElement = document.createElement("audio");
      this.audioElement.id = "myAudio";

      const audioEventHandler = (event) => this.handleEvent(event);
      this.audioElement.onabort = audioEventHandler;
      this.audioElement.oncanplay = audioEventHandler;
      this.audioElement.oncanplaythrough = audioEventHandler;
      this.audioElement.ondurationchange = audioEventHandler;
      this.audioElement.onemptied = audioEventHandler;
      this.audioElement.onended = audioEventHandler;
      this.audioElement.onerror = audioEventHandler;
      this.audioElement.onloadeddata = audioEventHandler;
      this.audioElement.onloadedmetadata = audioEventHandler;
      this.audioElement.onloadstart = audioEventHandler;
      this.audioElement.onpause = audioEventHandler;
      this.audioElement.onplay = audioEventHandler;
      this.audioElement.onplaying = audioEventHandler;
      this.audioElement.onprogress = audioEventHandler;
      this.audioElement.onratechange = audioEventHandler;
      this.audioElement.onseeked = audioEventHandler;
      this.audioElement.onseeking = audioEventHandler;
      this.audioElement.onstalled = audioEventHandler;
      this.audioElement.onsuspend = audioEventHandler;
      this.audioElement.ontimeupdate = audioEventHandler;
      this.audioElement.onvolumechange = audioEventHandler;
      this.audioElement.onwaiting = audioEventHandler;

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

  handleEvent(event) {
    console.log("AudioVisualization.handleEvent", { event });

    this.dispatchEvent(new Event(event.type, event));
  }

  //#endregion
}

export default AudioVisualization;
