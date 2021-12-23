import "routes/Record.css"
import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import LineRecordChart from "components/LineRecordChart";
import CalendarRecordChart from "components/CalendarRecordChart";
import axios from 'axios';

const TAG = "[Record]"

const tabEnum = {
  WEEK: 0,
  MONTH: 1,
  YEAR: 2
}

const Record = ({ isLoggedIn, userInfo, isMobile, setIsMobile }) => {

  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const [weekChartData, setWeekChartData] = useState(null);
  const [monthChartData, setMonthChartData] = useState(null);
  const [yearChartData, setYearChartData] = useState(null);

  const history = useHistory();

  const tabList = {
    0: (weekChartData) ? (
      <LineRecordChart chartData={weekChartData} />
    ) : (
      <>
      </>
    ),
    1: (monthChartData) ? (
      <LineRecordChart chartData={monthChartData} />
    ) : (
      <>
      </>
    ),
    2: (yearChartData) ? (
      <CalendarRecordChart
        chartData={yearChartData}
      />
    ) : (
      <>
      </>
    ),
  };

  useEffect(() => {
      console.log("한번만 요청해야 함")
      if (!isLoggedIn || !userInfo) {
        alert("로그인이 필요합니다.");
        history.push('/Login');
      }
      console.log(`[Record], isLoggedIn : `, isLoggedIn);
      console.log("[Record], userInfo:", userInfo)


      console.log(`${TAG} isMobile:`, isMobile);

      if (isMobile) {
        setIsMobile(isMobile)
      }
      
      requestChartData()
  }, []);

  const onTabClicked = (tabIndex) => {
    console.log("[Record] onWeekTabClicked, tabIndex :", tabIndex)
    setCurrentTabIndex(tabIndex);
  }

  const requestChartData = () => {
    console.log("[Record] requestChartData, userInfo:", userInfo)
    axios.post('/api/requestFocusTimeRecord', {
      'userIdx': userInfo.userIdx,
      }, 
      null
    )
    .then(res => {
      console.log("[Record] res.data: ", res.data)
      if ("weekRecords" in res.data) {
        console.log(`${TAG} res.data.weekRecords: `, res.data.weekRecords);
        let lineChartData = [];
        lineChartData.push({
          // "id": userInfo.userID,
          "id": "집중한 시간",
          "color": "hsl(297, 70%, 50%)"
        });

        lineChartData[0].data = [];
        res.data.weekRecords.forEach(element => {
          console.log(`${TAG} requestChartData, element :`, element);
          lineChartData[0].data.push({
            "x": element.day,
            "y": element.value
          })
        });

        setWeekChartData(lineChartData);
      }
      if ("monthRecords" in res.data) {
        console.log(`${TAG} res.data.monthRecords: `, res.data.monthRecords);
        let lineChartData = [];
        lineChartData.push({
          // "id": userInfo.userID,
          "id": "집중한 시간",
          "color": "hsl(297, 70%, 50%)"
        });

        lineChartData[0].data = [];
        res.data.monthRecords.forEach(element => {
          console.log(`${TAG} requestChartData, element :`, element);
          lineChartData[0].data.push({
            "x": element.day,
            "y": element.value
          })
        });

        setMonthChartData(lineChartData);
      }
      if ("yearRecords" in res.data) {
        console.log("[Record] res.data.yearRecords: ", res.data.yearRecords)
        console.log("[Record] res.data.fromYear: ", res.data.fromYear)
        console.log("[Record] res.data.toYear: ", res.data.toYear)
        setYearChartData(res.data);
      }
    })
    .catch();
  }

  return (
    <div className="record">
      <div className="tabs">
        <ul>
          <li
            className={(currentTabIndex === tabEnum.WEEK) ? 'active' : undefined}
            onClick={() => onTabClicked(tabEnum.WEEK)}>
            <a>Week</a>
          </li>
          <li
            className={(currentTabIndex === tabEnum.MONTH) ? 'active' : undefined}
            onClick={() => onTabClicked(tabEnum.MONTH)}>
            <a>Month</a>
          </li>
          <li
            className={(currentTabIndex === tabEnum.YEAR) ? 'active' : undefined}
            onClick={() => onTabClicked(tabEnum.YEAR)}>
            <a>Year</a>
          </li>
        </ul>
      </div>
      <div className="record__container">
        {tabList[currentTabIndex]}
      </div>
    </div>
  );
};
export default Record;