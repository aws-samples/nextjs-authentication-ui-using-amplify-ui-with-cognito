// @ts-ignore
function handler(event) {
  var request = event.request
  var uri = request.uri

  if (uri === '/') {
    return request
  }

  if (uri.endsWith('/')) {
    return {
      statusCode: 302,
      statusDescription: 'Found',
      headers: {
        location: {
          value: uri.slice(0, -1)
        }
      }
    }
  } else if (!uri.includes('.')) {
    request.uri += '.html'
  }

  return request
}
