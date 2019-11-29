import React from "react";

const queryString = require("query-string");
const { Ed25519KeyPair } = require("crypto-ld");
const jsigs = require("jsonld-signatures");
const vc = require("vc-js");
const { Ed25519Signature2018 } = jsigs.suites;
const { keyToDidDoc } = require("did-method-key").driver();

const defaultImage = "https://source.unsplash.com/collection/433313/1280x1024";

const parsed = queryString.parse(window.location.search);

class App extends React.Component {
  state = {
    issuerVerificationMethod: parsed.issuerVerificationMethod || "",
    toDID: "did:example:123",
    publicKeyBase58: parsed.publicKeyBase58 || "",
    privateKeyBase58: parsed.privateKeyBase58 || "",
    msg: parsed.msg || "",
    backgroundImage: defaultImage
  };

  async componentDidMount() {
    if (this.state.privateKeyBase58 === "") {
      const keyPair = await Ed25519KeyPair.generate();
      const didDoc = keyToDidDoc(keyPair);
      this.setState({
        issuerVerificationMethod: didDoc.id,
        publicKeyBase58: keyPair.publicKeyBase58,
        privateKeyBase58: keyPair.privateKeyBase58
      });
    }
    if (this.state.msg === "") {
      this.setState({
        msg: "Happy Holidays!"
      });
    }

    setTimeout(() => {
      this.makeCard();
    }, 500);
  }

  makeCard = () => {
    const canvas = this.canvasA;
    const context = this.canvasA.getContext("2d");
    const msg = this.state.msg;

    const image = new Image();
    image.src = this.state.backgroundImage;
    image.setAttribute("crossorigin", "anonymous");

    function drawText(string, fontSize, color, xOffset, yOffset) {
      const yStart = yOffset || 0 + 10;
      const xStart = xOffset || 0 + 10;
      context.font = fontSize.toString() + "px monospace";
      context.fillStyle = color;
      context.fillText(string, xStart, yStart);
    }

    image.onload = () => {
      context.drawImage(image, 0, 0, this.canvasA.width, this.canvasA.height);
      context.fillStyle = "RGBA(255, 255, 255, 0.8)";
      context.fillRect(0, 0, canvas.width, canvas.height / 4);
      const firstLineStart = 40;
      drawText("Message: " + msg, 20, "red", 0, firstLineStart);
      drawText(
        "From: " + this.state.issuerVerificationMethod,
        20,
        "red",
        0,
        firstLineStart + 32
      );
      drawText(
        "To: " + this.state.toDID,
        20,
        "red",
        0,
        firstLineStart + 32 * 2
      );
    };
  };

  convertCardToVC = async () => {
    const keyPair = new Ed25519KeyPair(this.state);
    const didDoc = keyToDidDoc(keyPair);
    const suite = new Ed25519Signature2018({
      issuerVerificationMethod: keyPair.id,
      key: keyPair
    });

    const cardAsDataUri = this.canvasA.toDataURL("image/png");

    const credential = {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://www.w3.org/2018/credentials/examples/v1"
      ],
      id: "https://example.com/credentials/1872",
      type: ["VerifiableCredential", "GreetingCard"],
      issuer: didDoc.id,
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: this.state.toDID
      },
      greetingCard: {
        image: cardAsDataUri,
        message: this.state.message,
        from: this.state.issuerVerificationMethod,
        to: this.state.toDID
      }
    };

    const signedVC = await vc.issue({ credential, suite });
    console.log(JSON.stringify(signedVC, null, 2));
  };

  render() {
    return (
      <React.Fragment>
        <div className={"vc-greeting-card-options"}>
          <h3>From Verification Method:</h3>
          <input
            value={this.state.issuerVerificationMethod}
            onChange={event => {
              this.setState({
                issuerVerificationMethod: event.target.value
              });
            }}
          />
          <br />

          <h3>From Private Key:</h3>
          <input
            value={this.state.privateKeyBase58}
            onChange={event => {
              this.setState({
                privateKeyBase58: event.target.value
              });
            }}
          />
          {/* <h3>From Public Key:</h3>
          <input
            value={this.state.publicKeyBase58}
            onChange={event => {
              this.setState({
                publicKeyBase58: event.target.value
              });
            }}
          /> */}

          <h3>To DID:</h3>
          <input
            value={this.state.toDID}
            onChange={event => {
              this.setState({
                toDID: event.target.value
              });
            }}
          />
          <br />

          <h3>Message:</h3>
          <input
            value={this.state.msg}
            onChange={event => {
              this.setState({
                msg: event.target.value
              });
              setTimeout(() => {
                this.makeCard();
              }, 500);
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
              setTimeout(() => {
                this.makeCard();
              }, 500);
            }}
          />
          <br />
          <h3>
            <button onClick={this.convertCardToVC}>Get VC Greeting Card</button>
          </h3>
        </div>

        <canvas
          style={{ margin: "0 auto" }}
          width="800"
          height="600"
          ref={canvasA => (this.canvasA = canvasA)}
        />
      </React.Fragment>
    );
  }
}
export default App;
