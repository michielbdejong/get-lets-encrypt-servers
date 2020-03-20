const getLetsEncryptServers = require('.')
async function example() {
  const domain = "example.com";
  const handler = (req, res) => {
    res.end("hello there");
  };
  const [ httpsServer, httpServer ] = await getLetsEncryptServers({
    domain,
    handler
  });
  await new Promise(resolve => setTimeout(resolve, 5000));
  console.log("Listening on ports 80 and 443, wait 5 seconds...");
  httpsServer.close();
  httpServer.close();
}
example();
