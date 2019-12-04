import React from "react";
import base64url from "base64url";
import queryString from "query-string";

import GreetingCardFromData from "../GreetingCardFromData/GreetingCardFromData";

import { download } from "../utils";
class GreetingCardFromURL extends React.Component {
  render() {
    const decoded = JSON.parse(
      base64url.decode(queryString.parse(window.location.search).vcgc)
    );
    return (
      <React.Fragment>
        <GreetingCardFromData
          greetingCard={
            decoded.greetingCard
              ? decoded.greetingCard
              : decoded.credentialSubject.greetingCard
          }
        />
        <pre>{JSON.stringify(decoded, null, 2)}</pre>
        <button
          onClick={() => {
            download("vc-greeting-card.json", JSON.stringify(decoded, null, 2));
          }}
        >
          Download
        </button>
      </React.Fragment>
    );
  }
}
export default GreetingCardFromURL;
