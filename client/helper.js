const handleError = (message) => {
    document.getElementById('login-error').textContent = message;
};

// helper method for sending data to the server
const sendPost = async (url, data) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  console.log(result);

  if(result.redirect) {
    window.location = result.redirect;
  }

  if(result.error) {
    handleError(result.error);
  }
};

module.exports = {
    handleError,
    sendPost,
}