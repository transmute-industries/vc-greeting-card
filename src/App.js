import React from "react";
import queryString from "query-string";

import MakeCard from "./MakeCard/MakeCard";
import GreetingCardFromURL from "./GreetingCardFromURL/GreetingCardFromURL";

const search = queryString.parse(window.location.search);

class App extends React.Component {
  render() {
    if (search.vcgc) {
      return <GreetingCardFromURL />;
    }
    return (
      <React.Fragment>
        <MakeCard />
      </React.Fragment>
    );
  }
}
export default App;
