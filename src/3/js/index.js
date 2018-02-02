class CustomHTMLElement extends HTMLElement {
  constructor() {
    super();
    console.log("CustomHTMLElement");
  }
}

class PlasticHTMLButtonElement extends HTMLButtonElement {
  constructor() {
    super();
    console.log("PlasticButton");
  }
}

customElements.define("x-custom", CustomHTMLElement);
customElements.define("plastic-button", PlasticHTMLButtonElement, { extends: "button" });
