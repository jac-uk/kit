/*eslint func-style: ["error", "declaration"]*/

import get from 'lodash/get.js';

export function getRandomString(length = 3) {
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  let randomCharacters = '';
  for (let i = 0, len = length; i < len; i++) {
    randomCharacters += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomCharacters;
}

export function calculateMean(numArray) {
  let total = 0;
  numArray.forEach(num => total += num);
  const mean = total / numArray.length;
  return mean;
}

export function calculateStandardDeviation(numArray) {
  const mean = calculateMean(numArray);
  let total = 0;
  numArray.forEach(num => total += Math.pow((num - mean), 2) );
  const variance = total / numArray.length;
  return Math.sqrt(variance);
}

export function normaliseNINs(nins) {
  return nins.map(nin => normaliseNIN(nin));
}


export function normaliseNIN(nin) {
  return nin ? nin.trim().replace(/-|\s/g,'').toLowerCase() : ''; //replace hyphens and spaces inside and on the outer side and makes lower case
}


export async function getDocuments(query) {
  const documents = [];
  const snapshot = await query.get();
  snapshot.forEach((doc) => {
    const document = doc.data();
    document.id = doc.id;
    document.ref = doc.ref;
    documents.push(document);
  });
  return documents;
}


export async function getDocumentsFromQueries(queries) {
  const documents = [];
  const querySnapshots = await Promise.all(queries.map(query => query.get()));
  querySnapshots.forEach((snapshot) => {
    snapshot.forEach(doc => {
    const document = doc.data();
    document.id = doc.id;
    document.ref = doc.ref;
    documents.push(document);
    });
  });
  return documents;
}


export async function getAllDocuments(db, references) {
  const documents = [];
  if (references.length) {
    const snapshot = await db.getAll(...references);
    snapshot.forEach((doc) => {
      const document = { ...doc.data() };
      document.id = doc.id;
      document.ref = doc.ref;
      documents.push(document);
    });
  }
  return documents;
}


export function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}


export async function applyUpdates(db, commands) {
  const BATCH_SIZE = 200;
  if (commands.length) {
    if (commands.length < BATCH_SIZE) {
      try {
        const batch = db.batch();
        for (let i = 0, len = commands.length; i < len; ++i) {
          switch (commands[i].command) {
          case 'delete':
            batch.delete(commands[i].ref);
            break;
          case 'set':
              batch.set(commands[i].ref, commands[i].data, { merge: true });
            break;
          default:
              batch[commands[i].command](commands[i].ref, commands[i].data);
          }
        }
        await batch.commit();
        return commands.length;
      } catch (error) {
        console.log(error);
        return false;
      }
    } else { // process in batches of 199
      let totalCommandsExecuted = 0;
      const chunkedCommands = chunkArray(commands, BATCH_SIZE - 1);
      for (let i = 0, len = chunkedCommands.length; i < len; ++i) {
        const result = await applyUpdates(db, chunkedCommands[i]);
        if (result) { totalCommandsExecuted += result; }
      }
      return totalCommandsExecuted;
    }
  }
  return false;
}


export function chunkArray(arr, size) {
  var myArray = [];
  for (var i = 0; i < arr.length; i += size) {
    myArray.push(arr.slice(i, i + size));
  }
  return myArray;
}


export function checkArguments(definitions, data) {
  // check data only contains defined props
  const allowedKeys = Object.keys(definitions);
  const providedKeys = Object.keys(data);
  for (let i = 0, len = providedKeys.length; i < len; ++i) {
    if (allowedKeys.indexOf(providedKeys[i]) < 0) {
      // console.log('data contains non-defined props');
      return false;
    }
  }

  // check data contains required definitions
  const requiredKeys = [];
  for (const key in definitions) {
    if (definitions[key].required) { requiredKeys.push(key); }
  }
  for (let i = 0, len = requiredKeys.length; i < len; ++i) {
    if (providedKeys.indexOf(requiredKeys[i]) < 0) {
      // console.log('data does not contain required props');
      return false;
    }
    // check required props have a value
    if (data[requiredKeys[i]].length === 0) {
      return false;
    }
  }
  // @TODO perhaps make this return richer information like `{ isOK: Boolean, message: String }`
  return true;
}

/**
 * 
 * @param {*} date 
 * @returns 
 */

export function isDate(date) {
  return date instanceof Date;
}


export function isValidDate(dateString) {
  if (typeof dateString !== 'string') {
    return false;
  }
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}


export function isDateInPast(date) {
  const dateToCompare = new Date(date);
  const today = new Date();
  return dateToCompare < today;
}


export function toDateString(date) {
  return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
    .toISOString()
    .split('T')[0];
}


export function toTimeString(date) {
  return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
    .toISOString()
    .split('T')[1];
}


export function formatDate(value, type) {
  value = convertToDate(value);
  if (value) {
    const day = value.getDate();
    const month = value.getMonth() + 1;
    const year = value.getFullYear();
    const time = value.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute:'2-digit',
      hour12: false,
      timeZone: 'Europe/London',
    });

    switch (type) {
      case 'time':
        value = toTimeString(value);
        break;
      case 'DD/MM/YYYY':
        // e.g. 30/11/2022 (ref: https://momentjs.com/docs/#/displaying/format/)
        value = `${day}/${month}/${year}`; // toLocaleDateString('en-GB') returns 30/11/2022 for some reason
        break;
      case 'MMM YYYY':
        // e.g. NOV 2022
        value = `${value.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()} ${value.toLocaleDateString('en-GB', { year: 'numeric' })}`;
        break;
      case 'date-hour-minute':
        // e.g. Wednesday, 30 November, 2022 at 13:00
        value = `${value.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${time}`;
        break;
      default:
        value = toDateString(value);
    }
  }
  return value ? value : '';
}


export function getEarliestDate(arrDates) {
  const sortedDates = arrDates.sort((a, b) => timeDifference(a, b));
  return sortedDates[0];
}


export function getLatestDate(arrDates) {
  const sortedDates = arrDates.sort((a, b) => timeDifference(a, b));
  return sortedDates[sortedDates.length - 1];
}


export function timeDifference(date1, date2) {
  date1 = convertToDate(date1);
  date2 = convertToDate(date2);
  if (date1 && date2) {
    const timestamp1 = date1.getTime();
    const timestamp2 = date2.getTime();
    return timestamp1 - timestamp2;
  } else {
    return 0;
  }
}


export function convertToDate(value) {
  if (value && (value.seconds !== undefined || value._seconds !== undefined)) { // convert firestore timestamp to date
    const seconds = value.seconds || value._seconds;
    const nanoseconds = value.nanoseconds || value._nanoseconds;
    value = new Timestamp(seconds, nanoseconds);
    value = value.toDate();
  }
  if (!isNaN(new Date(value).valueOf()) && value !== null) {
    if (!(value instanceof Date)) {
      return new Date(value);
    }
  }
  return value;
}


export function convertStringToSearchParts(value, delimiter) {
  const wordDelimiter = delimiter ? delimiter : ' ';
  const words = value.toLowerCase().split(wordDelimiter);
  const search = [];
  for (let j = 0, lenJ = words.length; j < lenJ; ++j) {
    // add previous word with word delimiter
    for (let k = 0; k < j; ++k) {
      const previousWords = words.slice(k, j).join(wordDelimiter);
      search.push(`${previousWords}${wordDelimiter}`);
    }
    // add letters from word
    for (let k = 0, lenK = words[j].length; k < lenK; ++k) {
      const letters = words[j].substr(0, k + 1);
      search.push(letters);
      // add letters to previous word(s)
      for (let l = 0; l < j; ++l) {
        const previousWords = words.slice(l, j).join(wordDelimiter);
        search.push(`${previousWords}${wordDelimiter}${letters}`);
      }
    }
  }
  return search;
}


export function removeHtml(str) {
  return str.replace(/(<([^>]+)>)/gi, '');
}


export function objectHasNestedProperty(obj, dotPath) {
  if (typeof dotPath !== 'string' || dotPath.trim() === '') {
    return false;
  }
  const keys = dotPath.split('.');
  let currentObj = obj;
  for (const key of keys) {
    if (!currentObj || typeof currentObj !== 'object' || !Object.prototype.hasOwnProperty.call(currentObj, key)) {
      return false;
    }
    currentObj = currentObj[key];
  }
  return true;
}


export function getMissingNestedProperties(obj, dotPaths) {
  const missingPaths = [];
  for (let i = 0; i < dotPaths.length; i++) {
    if (!objectHasNestedProperty(obj, dotPaths[i])) {
      missingPaths.push(dotPaths[i]);
    }
  }
  return missingPaths;
}

/**
 * Replace characters in a string according to a map
 * @param String str 
 * @param String characterMap 
 * @returns 
 */

export function replaceCharacters(inputString, characterMap) {
  // Convert the inputString to an array of characters
  const inputArray = inputString.split('');

  // Iterate through each character in the array
  for (let i = 0; i < inputArray.length; i++) {
    const char = inputArray[i];
    
    // Check if the character exists in the charMap
    if (Object.prototype.hasOwnProperty.call(characterMap, char)) {
      // Replace the character with its corresponding value from charMap
      inputArray[i] = characterMap[char];
    }
  }

  // Convert the modified array back to a string and return it
  return inputArray.join('');
}

/**
 * Format an address object into a string
 * 
 * @param {object} address 
 * @returns {string}
 */

export function formatAddress(address) {
  const result = [];
  if (address.street) result.push(address.street);
  if (address.street2) result.push(address.street2);
  if (address.town) result.push(address.town);
  if (address.county) result.push(address.county);
  if (address.postcode) result.push(address.postcode);
  return result.join(' ');
}

/**
 * Format an array of previous addresses into a string
 * 
 * @param {array} previousAddresses 
 * @returns {string}
 */

export function formatPreviousAddresses(previousAddresses) {
  if (Array.isArray(previousAddresses) && previousAddresses.length) {
    return previousAddresses.map((address) => {
      const dates = `${formatDate(address.startDate)} - ${formatDate(address.endDate)}`;
      const formattedAddress = formatAddress(address);
      return `${dates} ${formattedAddress}`;
    }).join('\n\n');
  }
  return '';
}


export function splitFullName(fullName) {
  const name = fullName.split(' ');
  let firstName = null;
  let lastName = null;
  if (name.length > 1) {
    firstName = name[0];
    name.shift();
    lastName = name.join(' ');
  } else {
    firstName = '';
    lastName = name[0];
  }
  return ([firstName, lastName]);
}

/**
 * Compare two object properties by string path so compatible with lodash _get and _has
 */

export function isDifferentPropsByPath(object1, object2, pathInObject) {
  const val1 = get(object1, pathInObject, null);
  const val2 = get(object2, pathInObject, null);
  return val1 !== val2;
}
