import Pact from "../pact-lang-api/pact";

const KEY_PAIR = {
  publicKey: "ba54b224d1924dd98403f5c751abdd10de6cd81b0121800bf7bdbdcfaec7388d",
  secretKey: "8693e641ae2bbe9ea802c736f42027b03f86afe63cae315e7169c9c496c17332"
};
const hostAddress = "http://localhost:8081";
const PACT_MODULE = "ipfs-inbox";
const pactCommandBody = {
  command: "(- 0 1)",
  data: {
    nonce: "arbitrary user data",
    "admin-keyset": [KEY_PAIR.publicKey]
  },
  host: hostAddress,
  keyPairs: KEY_PAIR
};

export const sendIPFSHash = (
  receiverAddress,
  ipfsAddress,
  callback,
  senderKeyset = '(read-keyset "admin-keyset")'
) => {
  pactCommandBody.command = `(${PACT_MODULE}.send-ipfs-address "${receiverAddress}" "${ipfsAddress}" ${senderKeyset})`;
  Pact.sendCommand(pactCommandBody)
    .then(re => callback(re))
    .catch(error => callback(error));
};

export const checkInbox = (address, callback) => {
  pactCommandBody.command = `(${PACT_MODULE}.check-inbox "${address}")`;
  Pact.sendCommand(pactCommandBody)
    .then(re => callback(re))
    .catch(error => callback(error));
};
