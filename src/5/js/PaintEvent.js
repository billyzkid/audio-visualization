class PaintEvent extends Event {
  constructor() {
    super("paint");
  }

  get audioContext() {
    return "audioContext";
  }

  get canvasContext() {
    return "canvasContext";
  }
}

export default PaintEvent;
