import React, { Component } from "react";

import "./App.css";
import ipfs from "./ipfs";
import { sendIPFSHash, checkInbox } from "./PactModuleWrappers/IPFSinbox";
import { Container, Row, Col, Alert } from "reactstrap";

class App extends Component {
  state = {
    ipfsHash: "",
    alertVisible: false
  };

  sendIPFSResult = result => {
    this.setState({ sendIPFSRequestResult: result });
  };

  createIpfsInboxResult = result => {
    this.setState({ createIpfsInboxRequestResult: result });
  };

  checkIPFSInboxResult = result => {
    this.setState({ receivedIPFShash: result });
  };

  convertToBuffer = async reader => {
    // file is converted to a buffer for upload to IPFS
    const buffer = await Buffer.from(reader.result);
    // set this buffer -using es6 syntax
    this.setState({ buffer });
  };

  captureFile = event => {
    event.stopPropagation();
    event.preventDefault();
    const file = event.target.files[0];
    let reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => this.convertToBuffer(reader);
  };

  onIPFSSubmit = async event => {
    event.preventDefault();

    //save document to IPFS,return its hash#, and set hash# to state
    await ipfs.add(this.state.buffer, (err, ipfsHash) => {
      this.setState({ ipfsHash: ipfsHash[0].hash });
    });
  };

  handleSend = event => {
    event.preventDefault();

    const ipfsHash = event.target.ipfsHash.value;
    const address = event.target.address.value;
    this.setState({
      showNotification: true,
      ipfsHash: ipfsHash,
      address: address
    });
    sendIPFSHash(address, ipfsHash, "BDT", this.sendIPFSResult);
    this.onDismiss();
  };

  checkIPFSInbox = () => {
    checkInbox(this.state.address, this.checkIPFSInboxResult);
  };

  handleAddressInput = event => {
    this.setState({ address: event.target.value });
  };

  onDismiss = () => {
    this.setState({ alertVisible: !this.state.alertVisible });
  };

  render() {
    const successAlert = (
      <Alert
        color="success"
        isOpen={this.state.alertVisible}
        toggle={this.onDismiss}
      >
        IPFS address of the file has been sent successfully.
      </Alert>
    );
    return (
      <Container>
        <Row className="mt-5 mb-2">
          <Col>
            <Row>
              <h2>1. Add file to IPFS</h2>
            </Row>
            <Row className="mt-2">
              <form className="form-group" onSubmit={this.onIPFSSubmit}>
                <Row className="mt-2 ml-1">
                  <input
                    type="file"
                    onChange={this.captureFile}
                    className="form-control-file"
                  />
                </Row>
                <Row className="mt-2 ml-1">
                  <button className="btn btn-primary" type="submit">
                    Get IPFS Hash
                  </button>
                </Row>
              </form>
            </Row>

            <Row>
              <h5>IPFS Hash: </h5>
              <p>{this.state.ipfsHash}</p>
            </Row>
          </Col>
        </Row>

        <Row className="mt-5 mb-2">
          <Col>
            <Row>
              <h2>2. Send notifications</h2>
            </Row>
            <Row className="mt-2">
              <form
                className="form-group"
                onSubmit={this.handleSend}
                style={{ width: "100%" }}
              >
                <Row className="mb-2">
                  <Col sm="2">
                    <label>Receiver Address:</label>
                  </Col>
                  <Col sm="7">
                    <input
                      id="address"
                      className="form-control"
                      style={{ width: "100%" }}
                      type="text"
                      onChange={this.handleAddressInput}
                    />
                  </Col>
                  <Col sm="3" />
                </Row>
                <Row className="mb-2">
                  <Col sm="2">
                    <label>IPFS Address:</label>
                  </Col>
                  <Col sm="7">
                    <input
                      id="ipfsHash"
                      className="form-control"
                      style={{ width: "100%" }}
                      type="text"
                    />
                  </Col>
                  <Col sm="3" />
                </Row>
                <Row>
                  <Col sm="7" />
                  <Col sm="2">
                    <input
                      style={{ float: "right" }}
                      type="submit"
                      value="Send"
                      className="form-control btn-success"
                      onSubmit={this.handleSend}
                    />
                  </Col>
                  <Col sm="3" />
                </Row>
                <Row className="mt-2">
                  <Col sm="2" />
                  <Col sm="7">{successAlert}</Col>
                  <Col sm="3" />
                </Row>
              </form>
            </Row>
          </Col>
        </Row>

        <Row className="mt-5">
          <Col>
            <Row>
              <h2>3. Receive notifications</h2>
            </Row>
            <Row className="mt-2">
              <button className="btn btn-success" onClick={this.checkIPFSInbox}>
                Receive IPFS
              </button>
            </Row>
            <Row className="mt-3">
              <h5>{this.state.receivedIPFShash}</h5>
            </Row>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default App;
