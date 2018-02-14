function getPrototypeChain(obj) {
  const prototypes = [];
  let prototype = obj.prototype;

  while (prototype) {
    prototypes.unshift(prototype);
    prototype = Object.getPrototypeOf(prototype);
  }

  return prototypes;
}

function getPropertyDescriptors(obj) {
  const prototypes = getPrototypeChain(obj);
  const descriptors = prototypes.map(Object.getOwnPropertyDescriptors);

  return Object.assign({}, ...descriptors);
}

function diff(obj1, obj2) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  const sources = keys1.filter((key) => !keys2.includes(key)).map((key) => ({ [key]: obj1[key] }));

  return Object.assign({}, ...sources);
}

export {
  getPrototypeChain,
  getPropertyDescriptors,
  diff
};
