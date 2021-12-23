import React, { useState, useEffect } from "react";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import Home from "routes/Home";
import Login from "routes/Login";
import Register from "routes/Register";
import Profile from "routes/Profile";
import Record from "routes/Record";
import ChatRoom from "routes/ChatRoom";
import Navigation from "components/Navigation";
import Header from "components/Header";


const AppRouter = ({isLoggedIn, userInfo, refreshUserInfo}) => {
   
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
      console.log(`[AppRouter], isLoggedIn : `, isLoggedIn);
      console.log(`[AppRouter], userInfo : `, userInfo);
   }, []);

  return (
    <Router>
      {
        (isMobile) ? <></> : <Header isLoggedIn={isLoggedIn} userInfo={userInfo} />
      }
      <div className="mainBody">
      <Navigation isLoggedIn={isLoggedIn} userInfo={userInfo}/>
      <Switch>
         <Route exact path="/">
            <Home isLoggedIn={isLoggedIn} userInfo={userInfo}/>
         </Route>
         <Route exact path="/Record">
            { (!isLoggedIn) ? <Login/> : <Record isLoggedIn={isLoggedIn} userInfo={userInfo} isMobile={false} setIsMobile={setIsMobile} /> } 
         </Route><Route exact path="/MobileRecord">
            { 
              (!isLoggedIn) ? <Login/> : <Record isLoggedIn={isLoggedIn} userInfo={userInfo} isMobile={true} setIsMobile={setIsMobile}/> 
            } 
         </Route>
         <Route exact path="/Register"> 
            { (!isLoggedIn) ? <Register/> : <Home isLoggedIn={isLoggedIn}/> } 
         </Route>
         <Route exact path="/Login"> 
            { (!isLoggedIn) ? <Login/> : <Home isLoggedIn={isLoggedIn}/>}    
         </Route>
         <Route exact path="/Profile"> 
            { (!isLoggedIn) ? <Login/> : <Profile userInfo={userInfo} refreshUserInfo={refreshUserInfo} />}    
         </Route>  
         <Route exact path="/ChatRoom/:roomID"> 
            { (isLoggedIn) ? <ChatRoom refreshUserInfo={refreshUserInfo} /> : <Login/> }
         </Route>     
      </Switch>
      </div>
    </Router>
  );
};
export default AppRouter;
