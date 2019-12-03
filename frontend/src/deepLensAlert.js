import React, { useEffect, useState } from "react";
import Sockette from "sockette";
let ws = null;

const DeepLensAlert = props => {  
  const { username } = props.authData;
  const [alertData, setAlertData] = useState('');

  useEffect(
    () => {
      if (props.authData)
        ws = new Sockette(
          "wss://" + process.env.REACT_APP_WS_API_NAME + "?token=" +
            props.authData.signInUserSession.accessToken.jwtToken,
          {
            timeout: 5e3,
            maxAttempts: 1,
            onopen: e => console.log("connected:", e),
            onmessage: e => onMessageReceied(e),
            onreconnect: e => console.log("Reconnecting...", e),
            onmaximum: e => console.log("Stop Attempting!", e),
            onclose: e => console.log("Closed!", e),
            onerror: e => console.log("Error:", e)
          }
        );
      return function cleanup() {
        ws && ws.close();
        ws = null;
      };
    }    
  );

  
  const onMessageReceied = ({ data }) => {    
    const eventAsString = JSON.stringify(data);
    debugger;
    setAlertData(eventAsString);
  };
  return (
    <div>
      <span>{alertData}</span>      
    </div>
  );
};

export default DeepLensAlert;
