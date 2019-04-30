import React, { Component } from "react";

import "./App.css";
import ipfs from "./ipfs";
import { sendIPFSHash, checkInbox } from "./PactModuleWrappers/IPFSinbox";
import { Container, Row, Col, Alert } from "reactstrap";

class App extends Component {
  state = {
    ipfsHash: "",
    receiverAddress: "",
    alertVisible: false,
    receivedIPFShash: {}
  };

  /**
   * sendIPFSResult() updates state on async sendIPFSHash() function call
   */
  sendIPFSResult = result => {
    this.setState({ sendIPFSRequestResult: result });
  };

  /**
   * checkIPFSInboxResult() updates state on async checkInbox() function call
   * If transaction fail then based on returned string message state
   * is updating to inform user.
   */
  checkIPFSInboxResult = result => {
    if (result.message) {
      if (result.message.includes("Inbox is Empty")) {
        this.setState({ receivedIPFShash: { Message: "Inbox is Empty" } });
      } else {
        if (result.message.includes("row not found")) {
          this.setState({ receivedIPFShash: { Message: "Address not found" } });
        } else {
          this.setState({ receivedIPFShash: { Error: result.message } });
        }
      }
    } else {
      this.setState({ receivedIPFShash: result });
    }
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

    this.setState({
      showNotification: true
    });
    sendIPFSHash(
      this.state.address,
      this.state.ipfsAddress,
      this.sendIPFSResult
    );
    this.onDismiss();
  };

  checkIPFSInbox = event => {
    event.preventDefault();
    checkInbox(this.state.receiverAddress, this.checkIPFSInboxResult);
  };

  handleAddressInput = event => {
    this.setState({ address: event.target.value });
  };

  handleReceiverAddressInput = event => {
    this.setState({ receiverAddress: event.target.value });
  };

  handleIPFSAddressInput = event => {
    event.preventDefault();
    this.setState({ ipfsAddress: event.target.value });
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
                      required="required"
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
                      required="required"
                      className="form-control"
                      style={{ width: "100%" }}
                      type="text"
                      onChange={this.handleIPFSAddressInput}
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

        <Row className="mt-5 mb-2">
          <Col>
            <Row>
              <h2>3. Receive notifications</h2>
            </Row>
            <Row className="mt-2">
              <form
                className="form-group"
                onSubmit={this.checkIPFSInbox}
                style={{ width: "100%" }}
              >
                <Row className="mb-2">
                  <Col sm="2">
                    <label>Receiver Address:</label>
                  </Col>
                  <Col sm="7">
                    <input
                      id="receiverAddress"
                      className="form-control"
                      style={{ width: "100%" }}
                      type="text"
                      value={this.state.receiverAddress}
                      onChange={this.handleReceiverAddressInput}
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
                      value="Receive IPFS"
                      className="form-control btn-success"
                      onSubmit={this.checkIPFSInbox}
                    />
                  </Col>
                  <Col sm="3" />
                </Row>
              </form>
            </Row>
            <Row className="mt-2">
              <h5>
                {Object.keys(this.state.receivedIPFShash).map(key => {
                  return (
                    <p key={key}>
                      <strong>{key}:</strong> {this.state.receivedIPFShash[key]}
                    </p>
                  );
                })}
              </h5>
            </Row>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default App;
