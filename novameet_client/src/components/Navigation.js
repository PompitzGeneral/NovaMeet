import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "components/Navigation.css"

const Navigation = ({ isLogin }) => {

  console.log(`Nav, isLogin : ${isLogin}`);

  return (
  <div className="sidebar">
    <div className="sidebar__categories">
      <div className="sidebar__category">
        <i className="material-icons">home</i>
        {/* Todo. 밑줄 없애기 */}
        <Link to="/"><span>홈</span></Link>
      </div>
      <div className="sidebar__category">
        <i className="material-icons">history</i>
        <Link to="/Record"><span>작업/학습 기록</span></Link>
        </div>
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