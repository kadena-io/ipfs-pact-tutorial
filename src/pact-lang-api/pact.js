import { Crypto } from "./crypto";

export default class Pact {
  static get host() {
    return Pact.host;
  }

  static set host(host) {
    Pact.host = host;
  }

  static get keyPairs() {
    return Pact.keyPairs;
  }

  static set keyPairs(keyPairs) {
    Pact.keyPairs = keyPairs;
  }

  static async sendCommand({
    command,
    data,
    host = undefined,
    keyPairs = undefined
  }) {
    const apiHost = host ? host : Pact.host;
    const keyPairSets = keyPairs ? keyPairs : Pact.keyPairs;

    if (!apiHost) {
      throw new Error(
        "Pact.sendCommand(): No `host` provided, and Pact() not instantiated with `host`"
      );
    }
    if (!command) {
      throw new Error("Pact.sendCommand(): No `command` provided");
    }
    if (!keyPairs) {
      throw new Error(
        "Pact.sendCommand(): No `keyPairs` provided and Pact() not instantiated with `keyPairs`"
      );
    }

    const commandJSON = Pact.simpleExecCommand({
      keyPairs: keyPairSets,
      code: command,
      data
    });
    console.log(`Executing Pact command: ${command} with JSON:`, commandJSON);

    // Fire a POST to /api/v1/send and parse the response for Command hashes
    const commandResponse = await fetch(`${apiHost}/api/v1/send`, {
      method: "POST",
      body: JSON.stringify(commandJSON)
    });
    const commandResponseJSON = await commandResponse.json();
    if (commandResponseJSON.status === "failure") {
      throw new Error(
        `PACT Failure in ${command}: ${commandResponseJSON.error}`
      );
    }

    //Fire a POST to /api/v1/listen for the result of a
    //single command
    // PactError on response's status failure
    const listenResponse = await fetch(`${apiHost}/api/v1/listen`, {
      method: "POST",
      body: JSON.stringify({ listen: commandJSON.cmds[0].hash })
    });

    const listenResponseJSON = await listenResponse.json();
    const result = listenResponseJSON.response.result;

    if (
      listenResponseJSON.status === "failure" ||
      result.status === "failure"
    ) {
      throw new Error(
        `PACT Failure in ${command} listen: ${result.error} detail: ${
          result.detail
        }`
      );
    }
    return result.data;
  }

  /**
   * simpleExecCommand() returns a correctly formatted JSON exec
   * msg for pact API
   * Throws PactError on maleformed inputs
   */
  static simpleExecCommand({ keyPairs, code, data = {}, address }) {
    const nonce = Date.now().toString();
    const payload = { exec: { code, data } };

    const cmd = JSON.stringify({ nonce, payload, address });
    const signedCommands = Array.isArray(keyPairs)
      ? keyPairs.map(kp => Crypto.sign(cmd, kp))
      : [Crypto.sign(cmd, keyPairs)];

    const sigs = signedCommands.map(signed =>
      Object({ sig: signed.sig, pubKey: signed.pubKey, hash: signed.hash })
    );

    // Test that all commands have the same hash
    const { hash } = sigs[0];
    const unmatchedHashCount = sigs.filter(sig => sig.hash !== hash);
    if (unmatchedHashCount.length > 0) {
      throw new Error(
        "Sigs for different hashes found: " + JSON.stringify(sigs)
      );
    }

    return { cmds: [{ hash, sigs, cmd }] };
  }
}
