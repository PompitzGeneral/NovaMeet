import React, { useState } from "react";
import {Link} from 'react-router-dom';
import "components/RoomContainerElement.css";

const RoomContainerElement = ({ roomInfo, onClickCallBack }) => {
    return (
      // <Link to={`/ChatRoom/${roomInfo.roomID}`}>
        <div className="room" onClick={onClickCallBack}>
            <div className="thumbnail">
            {/* Todo. roomInfo.ImagePath */}
              <img src="https://img.youtube.com/vi/ulprqHHWlng/maxresdefault.jpg" alt="" />
            </div>
            <div className="details">
              <div className="author">
              {/* Todo. 사용자 이미지 */}
                <img src="../profile.png" alt="" />
              </div>
              <div className="title">
                <h3>
                  {roomInfo.roomID}
                </h3>
                {/* <a href="">{roomInfo.roomOwner}</a> */}
                <span>{roomInfo.roomOwner}</span>
                {console.log(`roomInfo.roomMemberCurrntCount : ${roomInfo.roomMemberCurrentCount}`)}
                <span>참여인원 : {roomInfo.roomMemberCurrentCount}/{roomInfo.roomMemberMaxCount}</span>
              </div>
            </div>
        </div>
      // </Link>
    )
};

export default RoomContainerElement;