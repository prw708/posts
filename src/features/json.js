function getJSON(path, headers) {
  if (!path || typeof(path) !== 'string') {
    return null;
  }
  let httpRequest = new XMLHttpRequest();
  if (!httpRequest) {
    return null;
  }
  return new Promise(function(resolve, reject) {
    httpRequest.open('GET', path, true);
    if (headers && typeof(headers) === 'object') {
      for (let property in headers) {
        httpRequest.setRequestHeader(property, headers[property]);
      }
    }  
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
          let response = JSON.parse(httpRequest.responseText);
          resolve(response);
        } else {
          let response = JSON.parse(httpRequest.responseText);
          reject(response);
        }
      }
    };
  });
}

function postJSON(path, headers, jsonData) {
  if (typeof(jsonData) !== 'object' || !path || typeof(path) !== 'string') {
    return null;
  }
  let httpRequest = new XMLHttpRequest();
  if (!httpRequest) {
    return null;
  }
  return new Promise(function(resolve, reject) {
    httpRequest.open('POST', path, true);
    if (headers && typeof(headers) === 'object') {
      for (let property in headers) {
        httpRequest.setRequestHeader(property, headers[property]);
      }
    }  
    httpRequest.send(JSON.stringify(jsonData));
    httpRequest.onreadystatechange = function() {
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
          let response = JSON.parse(httpRequest.responseText);
          resolve(response);
        } else {
          let response = JSON.parse(httpRequest.responseText);
          reject(response);
        }
      }
    };
  });
}

export { getJSON, postJSON };
