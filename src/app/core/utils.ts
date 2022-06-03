export const _lowerObjectKeys = (obj: any | object): any | object => {
  if (!obj || typeof obj !== 'object' || Object.keys(obj).length === 0) {
    return {};
  }
  return Object.keys(obj).reduce((acc: any | object, key) => {
    acc[key.toLowerCase()] = obj[key];
    return acc;
  }, {});
};
