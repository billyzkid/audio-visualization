function getDescriptors(...args) {
  return args.reduce((obj, arg) => Object.assign(obj, Object.getOwnPropertyNames(arg).map((name) => ({ name, descriptor: Object.getOwnPropertyDescriptor(arg, name) })).filter((obj) => obj.descriptor.enumerable).reduce((acc, obj) => Object.assign(acc, { [obj.name]: obj.descriptor }), {})), {});
}

const allDescriptors = getDescriptors(HTMLElement.prototype, HTMLMediaElement.prototype, HTMLAudioElement.prototype);
const mediaDescriptors = getDescriptors(HTMLMediaElement.prototype, HTMLAudioElement.prototype);
const eventDescriptors = Object.keys(allDescriptors).filter((key) => key.startsWith("on")).reduce((obj, key) => Object.assign(obj, { [key]: allDescriptors[key] }), {});
const methodDescriptors = Object.keys(mediaDescriptors).filter((key) => !key.startsWith("on") && typeof mediaDescriptors[key].value == "function").reduce((obj, key) => Object.assign(obj, { [key]: mediaDescriptors[key] }), {});
const propertyDescriptors = Object.keys(mediaDescriptors).filter((key) => !key.startsWith("on") && typeof mediaDescriptors[key].get == "function").reduce((obj, key) => Object.assign(obj, { [key]: mediaDescriptors[key] }), {});
const writablePropertyDescriptors = Object.keys(mediaDescriptors).filter((key) => !key.startsWith("on") && typeof mediaDescriptors[key].get == "function" && typeof mediaDescriptors[key].set == "function").reduce((obj, key) => Object.assign(obj, { [key]: mediaDescriptors[key] }), {});
const readonlyPropertyDescriptors = Object.keys(mediaDescriptors).filter((key) => !key.startsWith("on") && typeof mediaDescriptors[key].get == "function" && typeof mediaDescriptors[key].set == "undefined").reduce((obj, key) => Object.assign(obj, { [key]: mediaDescriptors[key] }), {});

console.log("all descriptors", allDescriptors);
console.log("media descriptors", mediaDescriptors);
console.log("events", Object.keys(eventDescriptors).sort());
console.log("methods", Object.keys(methodDescriptors).sort());
console.log("properties", Object.keys(propertyDescriptors).sort());
console.log("writable properties", Object.keys(writablePropertyDescriptors).sort());
console.log("readonly properties", Object.keys(readonlyPropertyDescriptors).sort());
