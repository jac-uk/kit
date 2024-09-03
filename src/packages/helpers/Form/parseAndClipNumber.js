import clipNumber from './clipNumber.js';

const parseAndClipNumber = (val, min, max) => {
  val = parseInt(val);

  if (isNaN(val)) {
    return null;
  }

  return clipNumber(val, min, max);
};

export default parseAndClipNumber;
