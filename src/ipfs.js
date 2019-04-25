//using the infura.io node, otherwise ipfs requires you to run a //daemon on your own computer/server.

const IPFS = require("ipfs-http-client");
const ipfs = new IPFS({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https"
});

// run with local daemon
// const IPFS = require(‘ipfs-http-client’);
// const ipfs = new IPFS(‘localhost’, ‘5001’, {protocol:‘http’});

export default ipfs;
