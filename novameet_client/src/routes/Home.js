import React, { useState, useEffect } from "react";
import "routes/Home.css"

const Home = () => {

  const [loginID] = useState("");
  useEffect(() => {
      // - ReactHook - 
      // componentDidMount, componentDidUpdate, componentWillDismount 시 일어날 항목 제어
  }, []);
  return (
      <div className="videos">
        <h1>방 목록</h1>

        <div className="videos__container">
          <div className="video">
            <div className="video__thumbnail">
              <img src="https://img.youtube.com/vi/ulprqHHWlng/maxresdefault.jpg" alt="" />
            </div>
            <div className="video__details">
              <div className="author">
                <img src="../profile.png" alt="" />
              </div>
              <div className="title">
                <h3>
                  백엔드 팀 업무방
                </h3>
                {/* Todo. User 정보로 이동 */}
                <a href="">이동근</a>
                <span>참여인원 : 3/4</span>
              </div>
            </div>
            <a href="/"></a>
          </div>

          {/*<div className="video">
            <div className="video__thumbnail">
              <img src="https://img.youtube.com/vi/2Ji-clqUYnA/maxresdefault.jpg" alt="" />
            </div>
            <div className="video__details">
              <div className="author">
                <img src="../assets/img/profile.png" alt="" />
              </div>
              <div className="title">
                <h3>
                  프론트엔드 팀 업무방
                </h3>
                <a href="">이동근</a>
                <span>참여인원 : 5/8</span>
              </div>
            </div>
            <a href=""></a>
          </div>

          <div class="video">
            <div class="video__thumbnail">
              <img src="https://img.youtube.com/vi/PpXUTUXU7Qc/maxresdefault.jpg" alt="" />
            </div>
            <div class="video__details">
              <div class="author">
                <img src="../assets/img/profile.png" alt="" />
              </div>
              <div class="title">
                <h3>
                  안드로이드 팀 업무방
                </h3>
                <a href="">이동근</a>
                <span>참여인원 : 3/4</span>
              </div>
            </div>
            <a href=""></a>
          </div>

          <div class="video">
            <div class="video__thumbnail">
              <img src="https://img.youtube.com/vi/PpXUTUXU7Qc/maxresdefault.jpg" alt="" />
            </div>
            <div class="video__details">
              <div class="author">
                <img src="../assets/img/profile.png" alt="" />
              </div>
              <div class="title">
                <h3>
                  액티비티 생명주기 관련해서 하브루타 해요~
                </h3>
                <a href="">이동근</a>
                <span>참여인원 : 7/12</span>
              </div>
            </div>
            <a href=""></a>
          </div>

          <div class="video">
            <div class="video__thumbnail">
              <img src="https://img.youtube.com/vi/PpXUTUXU7Qc/maxresdefault.jpg" alt="" />
            </div>
            <div class="video__details">
              <div class="author">
                <img src="../assets/img/profile.png" alt="" />
              </div>
              <div class="title">
                <h3>
                  8시간 같이 공부하실분??
                </h3>
                <a href="">이동근</a>
                <span>참여인원 : 3/4</span>
              </div>
            </div>
            <a href=""></a>
          </div>

          <div class="video">
            <div class="video__thumbnail">
              <img src="https://img.youtube.com/vi/d2na6sCyM5Q/maxresdefault.jpg" alt="" />
            </div>
            <div class="video__details">
              <div class="author">
                <img src="../assets/img/profile.png" alt="" />
              </div>
              <div class="title">
                <h3>
                  자바 기초 화요일 11시 공부방
                </h3>
                <a href="">이동근</a>
                <span>참여인원 : 3/4</span>
              </div>
            </div>
            <a href=""></a>
          </div>

          <div class="video">
            <div class="video__thumbnail">
              <img src="https://img.youtube.com/vi/CVClHLwv-4I/maxresdefault.jpg" alt="" />
            </div>
            <div class="video__details">
              <div class="author">
                <img src="../assets/img/profile.png" alt="" />
              </div>
              <div class="title">
                <h3>
                  PHP 기초 수요일 11시 공부방
                </h3>
                <a href="">이동근</a>
                <span>참여인원 : 3/8</span>
              </div>
            </div>
            <a href=""></a>
          </div>

          <div class="video">
            <div class="video__thumbnail">
              <img src="https://img.youtube.com/vi/d2na6sCyM5Q/maxresdefault.jpg" alt="" />
            </div>
            <div class="video__details">
              <div class="author">
                <img src="../assets/img/profile.png" alt="" />
              </div>
              <div class="title">
                <h3>
                  안드로이드 기초 목요일 2시 공부방
                </h3>
                <a href="">이동근</a>
                <span>참여인원 : 3/4</span>
              </div>
            </div>
            <a href=""></a>
          </div> */}
        </div>
      </div>
  );
};
export default Home;
