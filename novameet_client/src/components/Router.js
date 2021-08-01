import React from "react";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import Home from "routes/Home";
import Login from "routes/Login";
import Register from "routes/Register";
import Record from "routes/Record";
import ChatRoom from "routes/ChatRoom";
import Navigation from "components/Navigation";
import Header from "components/Header";

const AppRouter = ({ isLogin, userInfo }) => {
   console.log(`Router, isLogin : ${isLogin}`);

  return (
    <Router>
       <Header isLogin={isLogin} userInfo={userInfo}/>
       <div className="mainBody">
      <Navigation isLogin={isLogin}/>
      <Switch>
         <Route exact path="/">
            <Home isLogin={isLogin}/>
         </Route>
         <Route exact path="/Record">
            <Record/>
         </Route>
         <Route exact path="/Register"> 
            { (!isLogin) ? <Register/> : <Home isLogin={isLogin}/> } 
         </Route>
         <Route exact path="/Login"> 
            { (!isLogin) ? <Login/> : <Home isLogin={isLogin}/>}    
         </Route>  
         <Route exact path="/ChatRoom/:roomID"> 
            { (isLogin) ? <ChatRoom/> : <Login/> }
         </Route>     
      </Switch>
      </div>
    </Router>
  );
};
export default AppRouter;
