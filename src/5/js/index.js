import AudioVisualization from "./AudioVisualization.js";

customElements.define("audio-visualization", AudioVisualization);

// const adoptedChildren = adoptedLink.import.querySelectorAll("audio-visualization");
// adoptedChildren.forEach((child) => document.body.appendChild(child));

// function getDescriptors(...args) {
//   return args.reduce((obj1, arg) => Object.assign(obj1, Object.getOwnPropertyNames(arg).reduce((obj2, name) => Object.assign(obj2, { [name]: Object.getOwnPropertyDescriptor(arg, name) }), {})), {});
// }

// const audioDescriptors = getDescriptors(HTMLMediaElement.prototype, HTMLAudioElement.prototype);
// const audioDescriptorKeys = Object.keys(audioDescriptors);
// const audioVisualizationDescriptors = getDescriptors(AudioVisualization.prototype);
// const audioVisualizationDescriptorKeys = Object.keys(audioVisualizationDescriptors);
// const addedKeys = audioVisualizationDescriptorKeys.filter((key) => audioDescriptorKeys.indexOf(key) === -1).sort();
// const addedDescriptors = addedKeys.map((key) => ({ [key]: audioVisualizationDescriptors[key] })).reduce((obj, descriptor) => Object.assign(obj, descriptor), {});
// const missingKeys = audioDescriptorKeys.filter((key) => audioVisualizationDescriptorKeys.indexOf(key) === -1).sort();
// const missingDescriptors = missingKeys.map((key) => ({ [key]: audioDescriptors[key] })).reduce((obj, descriptor) => Object.assign(obj, descriptor), {});

// console.log("Audio descriptors", audioDescriptors);
// console.log("AudioVisualization descriptors", audioVisualizationDescriptors);
// console.log("AudioVisualization descriptors added", addedDescriptors);
// console.log("AudioVisualization descriptors missing", missingDescriptors);
