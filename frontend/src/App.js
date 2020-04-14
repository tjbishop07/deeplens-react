import React, { Component } from "react";
import Amplify from "aws-amplify";
import { withAuthenticator } from "aws-amplify-react";
import aws_exports from "./config";
import logo from "./logo.svg";
import "./App.css";
import DeepLensAlert from "./deepLensAlert";

Amplify.configure(aws_exports);

class App extends Component {
  render() {
    return (
      <div className="App">
        {/* <header className="App-header"> */}
        {/* <img src={logo} className="App-logo" alt="logo" /> */}
        {/* <b>Face Confidence</b>         */}
        <DeepLensAlert {...this.props} />
        {/* </header>         */}
      </div>
    );
  }
}

export default withAuthenticator(App, { includeGreetings: true }, false);
