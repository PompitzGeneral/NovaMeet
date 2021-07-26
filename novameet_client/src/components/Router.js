import React from "react";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import Home from "routes/Home";
import Login from "routes/Login";
import Register from "routes/Register";
import Record from "routes/Record";
import ChatRoom from "routes/ChatRoom";
import Navigation from "components/Navigation";
import Header from "components/Header";

const AppRouter = ({isLogin}) => {
   console.log(`Router, isLogin : ${isLogin}`);
  return (
    <Router>
       <Header isLogin={isLogin}/>
       <div className="mainBody">
      <Navigation isLogin={isLogin}/>
      <Switch>
         <Route exact path="/">
            <Home/>
         </Route>
         <Route exact path="/record">
            <Record/>
         </Route>
         <Route exact path="/login">
            <Login/>
         </Route>
         <Route exact path="/register">
            <Register/>
         </Route>
         <Route exact path="/chatroom">
            <ChatRoom/>
         </Route>
      </Switch>
      </div>
    </Router>
  );
};
export default AppRouter;
