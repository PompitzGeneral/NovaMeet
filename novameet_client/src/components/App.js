import React, { useState, useEffect } from "react";
import AppRouter from "components/Router";
import axios from 'axios';
import "components/App.css"

function App() {

  const [init, setInit] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    // 1. 유저 정보 요청
    console.log("app.js useEffect");
    
    refreshUserInfo();
  }, []);

  const refreshUserInfo = () => { 
    console.log(`refreshUserInfo`);

    axios.post('/api/requestUserInfo', null, null)
    .then(res => {
      // 2. 유저 정보 수신
      // email, displayName, image
      console.log(`res.data.userInfo : `);
      console.log(res.data.userInfo);
      
      // 3. 유저 정보 갱신
      setUserInfo(res.data.userInfo);
      setInit(true);
    })
   .catch((e) => {
     console.log(e);
     setUserInfo(null);
     setInit(true);
   });
  };

  return (
    <>
    {
      init ? (
        <AppRouter
          isLoggedIn={Boolean(userInfo)}
          userInfo={userInfo}
          refreshUserInfo={refreshUserInfo}
        />
      ) : (
        "Initializing..."
      )}
    </>
  );
}

export default App;
