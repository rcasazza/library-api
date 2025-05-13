import autocannon from 'autocannon';

function runTest(title, options) {
  const instance = autocannon(options, (err, results) => {
    if (err) console.error(`${title} failed:`, err);
    else console.log(`${title} results:\n`, autocannon.printResult(results));
  });

  autocannon.track(instance, { renderProgressBar: true });
}

// Example: test /api/login
runTest('Login Endpoint', {
  url: 'http://localhost:3000/api/login',
  method: 'POST',
  connections: 20,
  duration: 15,
  headers: {
    'Content-type': 'application/json'
  },
  body: JSON.stringify({
    userName: 'testuser',
    password: 'secret'
  })
});