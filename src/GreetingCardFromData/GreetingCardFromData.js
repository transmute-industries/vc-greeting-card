import React from "react";

class GreetingCardFromData extends React.Component {
  render() {
    const { greetingCard } = this.props;
    return (
      <div
        className="vc-greeting-card-wrapper"
        style={{
          backgroundImage: `url("${greetingCard.image}")`
        }}
      >
        <div className="vc-greeting-card-header">
          <h3>
            <span className="vc-greeting-card-label">From: </span>
            {greetingCard.from}
          </h3>
          <h3>
            <span className="vc-greeting-card-label">To: </span>
            {greetingCard.to}
          </h3>
          <h3>
            <span className="vc-greeting-card-label">Message: </span>
            {greetingCard.message}
          </h3>
        </div>
      </div>
    );
  }
}
export default GreetingCardFromData;
