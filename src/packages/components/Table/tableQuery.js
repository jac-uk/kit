import firebase from '@firebase/app';

const search = (searchValue) => {
  let returnValue = null;
  const searchArr = [...searchValue];
  let searchStr, searchStrNext;
  const searchLenght = searchArr.length;

  if (searchValue) {
    // searchArr[0] = searchArr[0].toUpperCase(); // First letter Uppercase
    searchStr = searchArr.join('');
    const nextLastCharacter = nextChar(searchArr[searchLenght - 1]);
    searchArr[searchLenght - 1] = nextLastCharacter;
    searchStrNext = searchArr.join('');
    returnValue = { 'value1': searchStr, 'value2': searchStrNext };
  }
  return returnValue;
};

const nextChar = (c) => String.fromCharCode(c.charCodeAt(0) + 1);

const getValueAtObjectPath = (object, path) => {
  if (path && path.indexOf('.') >= 0) {
    let currentPath = path.substring(0, path.indexOf('.'));
    let remainingPath = path.substring(path.indexOf('.') + 1);
    let valueAtPath = object[currentPath];
    while (remainingPath.indexOf('.') >= 0) {
      currentPath = remainingPath.substring(0, remainingPath.indexOf('.'));
      remainingPath = remainingPath.substring(remainingPath.indexOf('.') + 1);
      valueAtPath = valueAtPath[currentPath];
    }
    valueAtPath = valueAtPath[remainingPath];
    return valueAtPath;
  } else {
    return object[path];
  }
};

const tableQuery = (data, ref, params) => {
  let queryRef = ref;
  if (params) {
    if (params.where) {
      params.where.forEach(item => {
        queryRef = queryRef.where(item.field, item.comparator, item.value);
      });
    }

    let orderBy;
    if (params.orderBy) {
      orderBy = (params.orderBy && params.orderBy instanceof Array) ? params.orderBy : [params.orderBy];  // ensure orderby is an array
    }

    if (params.searchTerm) {
      if (params.customSearch) {
        if (params.customSearchValues) {
          if (params.customSearch.field === 'id') {
            queryRef = queryRef
              .where(firebase.firestore.FieldPath.documentId(), 'in', params.customSearchValues);
          } else {
            queryRef = queryRef
              .where(params.customSearch.field, 'in', params.customSearchValues);
          }
        } else {
          return;
        }
      } else {
        const returnSearch = search(params.searchTerm);
        if (returnSearch) {
          queryRef = queryRef
            .where(params.search[0], '>=', returnSearch.value1)
            .where(params.search[0], '<', returnSearch.value2)
            .orderBy(params.search[0], 'asc');
          orderBy = [params.search[0]];
        }
      }
    } else if (orderBy) {
      const direction = params.direction ? params.direction : 'asc';
      orderBy.forEach(field => {
        if (field === 'documentId') {
          queryRef = queryRef.orderBy(firebase.firestore.FieldPath.documentId(), direction);
        } else {
          queryRef = queryRef.orderBy(field, direction);
        }
      });
    }

    if (params.pageSize) {
      if (params.pageChange > 0) {
        // page forward
        if (data.length) {
          const startAfter = [];
          orderBy.forEach(field => {
            if (field === 'documentId') {
              startAfter.push(data[data.length - 1].id);
            } else {
              startAfter.push(getValueAtObjectPath(data[data.length - 1], field));
            }
          });
          queryRef = queryRef
            .startAfter(...startAfter)
            .limit(params.pageSize);
        } else {
          queryRef = queryRef.limit(params.pageSize);
        }
      } else if (params.pageChange < 0) {
        // page backward
        if (data.length) {
          const endBefore = [];
          orderBy.forEach(field => {
            if (field === 'documentId') {
              endBefore.push(data[0].id);
            } else {
              endBefore.push(getValueAtObjectPath(data[0], field));
            }
          });
          queryRef = queryRef
            .endBefore(...endBefore)
            .limitToLast(params.pageSize);
        } else {
          queryRef = queryRef.limit(params.pageSize);
        }
      } else {
        queryRef = queryRef.limit(params.pageSize);
      }
    }
  }
  return queryRef;
};

export default tableQuery;
