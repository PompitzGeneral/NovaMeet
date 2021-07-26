
import "components/Header.css"
import { Link } from 'react-router-dom';

const Header = ({ isLogin }) => {

  const onMenuButtonClicked = () => {
    console.log("Menu Button Clicked");
    //Todo. 메뉴 열기 닫기
  };

  const onMakeRoomButtonClicked = () => {
    console.log("MakeRoom Button Clicked");
    //Todo. 메뉴 열기 닫기
  };

  const onLogoutButtonClicked = () => {
    // sessionStorage 에 user_id 로 저장되어있는 아이템을 삭제한다.
    console.log("onLogoutButtonClicked");
    sessionStorage.removeItem('user_id')
    document.location.href = '/';
  }

  return (
    <div className="header">
      <div className="header__left">
        {/* 네비게이션 바 제어 기능 구차 */}
        <i id="menu" className="material-icons">menu</i>
        <Link to="/"><img src="teamnova_logo.png" /></Link>
      </div>

      <div className="header__search">
        <form action="">
          <input type="text" placeholder="Search" />
          <button><i className="material-icons">search</i></button>
        </form>
      </div>


      <div className="header__icons">

        {/* <i className="material-icons display-this">search</i>
          <i className="material-icons">videocam</i>
          <i className="material-icons">apps</i>
          <i className="material-icons">notifications</i> */}
        
      </div>
      <div className="header__right">
      {isLogin ? (
          <>
              <Link to="/ChatRoom">
              <div className="header__right__element" onClick={onMakeRoomButtonClicked}>
                <i className="material-icons">login</i>
                <span>방 만들기</span>
              </div>
              </Link>
              <div className="header__right__element" onClick={onLogoutButtonClicked}>
                <i className="material-icons">login</i>
                <span>로그아웃</span>
              </div>
          </>
        ) : (
          <>
            <Link to="/Login">
            {/* className="sidebar__category" */}
              <div>
                <i className="material-icons">login</i>
                <span>로그인</span>
              </div>
            </Link>
            <Link to="/Register">
            {/* className="sidebar__category" */}
              <div>
                <i className="material-icons">login</i>
                <span>회원가입</span>
              </div>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Header;