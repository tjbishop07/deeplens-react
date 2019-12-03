const aws_exports = {
  Auth: {
    region: "us-east-1",
    userPoolId: process.env.REACT_APP_USER_POOL_ID,
    userPoolWebClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID,
    mandatorySignIn: false,
    authenticationFlowType: "USER_SRP_AUTH"
  }
};

export default aws_exports;
