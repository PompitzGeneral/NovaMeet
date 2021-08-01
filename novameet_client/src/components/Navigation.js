import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "components/Navigation.css"

const Navigation = ({ isLogin }) => {

  console.log(`Nav, isLogin : ${isLogin}`);

  return (
  <div className="sidebar">
    <div className="sidebar__categories">
      <Link to="/">
      <div className="sidebar__category">
        <i className="material-icons">home</i>
        {/* Todo. 밑줄 없애기 */}
        <span>홈</span>
      </div>
      </Link>
      <Link to="/Record">
      <div className="sidebar__category">
        <i className="material-icons">history</i>
        <span>작업/학습 기록</span>
      </div>
      </Link>
    </div>
      
    {/* <hr />
    <div className="sidebar__categories">
      <div className="sidebar__category">
        <i className="material-icons">library_add_check</i>
        <span>관리자 페이지</span>
      </div>
    </div>
    <hr /> */}
  </div>
)};

export default Navigation;