import React from "react";
import base64url from "base64url";
import wrappedDocumentLoader from "../wrappedDocumentLoader";

import GreetingCardFromData from "../GreetingCardFromData/GreetingCardFromData";

const { Ed25519KeyPair } = require("crypto-ld");
const jsigs = require("jsonld-signatures");
const vc = require("vc-js");
const { Ed25519Signature2018 } = jsigs.suites;
const { keyToDidDoc } = require("did-method-key").driver();

const defaultImage = "http://i.imgur.com/SxtVfyQ.jpg";

class MakeCard extends React.Component {
  state = {
    issuerVerificationMethod: "",
    toDID: "did:example:123",
    publicKeyBase58: "",
    privateKeyBase58: "",
    message: "Happy Holidays!",
    backgroundImage: defaultImage
  };

  async componentDidMount() {
    const keyPair = await Ed25519KeyPair.generate();
    const didDoc = keyToDidDoc(keyPair);
    this.setState({
      issuerVerificationMethod: didDoc.id,
      publicKeyBase58: keyPair.publicKeyBase58,
      privateKeyBase58: keyPair.privateKeyBase58
    });
  }

  convertCardToVC = async () => {
    const keyPair = new Ed25519KeyPair({
      publicKeyBase58: this.state.publicKeyBase58,
      privateKeyBase58: this.state.privateKeyBase58
    });
    const didDoc = keyToDidDoc(keyPair);
    const suite = new Ed25519Signature2018({
      issuerVerificationMethod: didDoc.id,
      key: keyPair
    });

    const credential = {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://transmute-industries.github.io/vc-greeting-card/context/vc-greeting-card-v0.0.jsonld"
      ],
      id: "https://example.com/credentials/1872",
      type: ["VerifiableCredential", "GreetingCard"],
      issuer: didDoc.id,
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: this.state.toDID,
        greetingCard: {
          type: "HolidayCard",
          image: this.state.backgroundImage,
          message: this.state.message,
          from: this.state.issuerVerificationMethod,
          to: this.state.toDID
        }
      }
    };

    const signedVC = await vc.issue({
      credential,
      suite,
      documentLoader: wrappedDocumentLoader({
        /// injectable document loader...
      })
    });

    const asString = JSON.stringify(signedVC);
    const asEncoded = base64url.encode(asString);
    const asUrl = window.location.href + "?vcgc=" + asEncoded;
    window.location.href = asUrl;
  };

  render() {
    return (
      <React.Fragment>
        <div className={"vc-greeting-card-options"}>
          <h3>From Private Key:</h3>
          <input
            value={this.state.privateKeyBase58}
            onChange={event => {
              this.setState({
                privateKeyBase58: event.target.value
              });
            }}
          />

          <h3>From Public Key:</h3>

          <input
            value={this.state.publicKeyBase58}
            onChange={event => {
              const keyPair = new Ed25519KeyPair({
                publicKeyBase58: event.target.value,
                privateKeyBase58: this.state.privateKeyBase58
              });

              const didDoc = keyToDidDoc(keyPair);

              this.setState({
                publicKeyBase58: event.target.value,
                issuerVerificationMethod: didDoc.id
              });
            }}
          />

          <h3>To DID:</h3>
          <input
            value={this.state.toDID}
            onChange={event => {
              this.setState({
                toDID: event.target.value
              });
            }}
          />

          <h3>Message:</h3>
          <input
            value={this.state.message}
            onChange={event => {
              this.setState({
                message: event.target.value
              });
            }}
          />
          <br />
          <h3>Background: </h3>
          <input
            value={this.state.backgroundImage}
            onChange={event => {
              this.setState({
                backgroundImage: event.target.value
              });
            }}
          />
          <br />
          <h3>
            <button onClick={this.convertCardToVC}>Get VC Greeting Card</button>
          </h3>
        </div>

        <GreetingCardFromData
          greetingCard={{
            image: this.state.backgroundImage,
            from: this.state.issuerVerificationMethod,
            to: this.state.toDID,
            message: this.state.message
          }}
        />
      </React.Fragment>
    );
  }
}
export default MakeCard;
