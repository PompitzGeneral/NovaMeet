import connectionPool from "../db.js";
// import { NetworkFirewall } from "aws-sdk";

const TAG = "recordController"
const pool = connectionPool;

const selectFocusTimeRecordQuery = `
SELECT daily_focus_time, record_date
FROM focus_time_record
WHERE user_idx = ? AND ( record_date BETWEEN ? AND ? )
`;

function leftPad(value) {
  if (value >= 10) {
    return value;
  }
  return `0${value}`;
}

function toStringByFormatting(source, delimiter = '-') {
  const year = source.getFullYear();
  const month = leftPad(source.getMonth() + 1);
  const day = leftPad(source.getDate());
  return [year, month, day].join(delimiter);
}

export const postRequestFocusTimeRecord = async (req, res) => {
  console.log("[userController] received postRequestFocusTimeRecord");
  console.log("[userController] req.body :", req.body);
  const userIdx = req.body.userIdx;

  let data = {};

  pool.getConnection(async (err, connection) => {
    if (err) {
      console.log("[userController] pool.getConnection Error:", err);
      connection.release();
      res.send(err);
      return;
    }
    await setWeekRecords(userIdx, data, connection).then(console.log("[userController] then setWeekRecords"));
    await setMonthRecords(userIdx, data, connection).then(console.log("[userController] then setMonthRecords"));
    await setYearRecords(userIdx, data, connection, res).then(console.log("[userController] then setYearRecords"));

    console.log("[userController] postRequestFocusTimeRecord, sendData:", data);
    //res.send(data);
    connection.release();
  });
};

async function setWeekRecords(userIdx, data, connection) {
  console.log(`[userController] setWeekRecords`);
  let fromDate = new Date();
  let now = new Date();

  fromDate.setDate(now.getDate() - 6);
  let from = toStringByFormatting(fromDate);
  let to = toStringByFormatting(now);
  let param = [userIdx, from, to];

  await connection.query(selectFocusTimeRecordQuery, param, (err, row) => {
    if (err) {
      console.log(`[userController] setWeekRecords, Error `, err);
      res.send(err);
      return;
    }

    let records = [];
    // day 데이터 세팅
    while (fromDate <= now) {
      console.log(`${TAG} fromDate:`, fromDate);
      console.log(`${TAG} nowDate:`, now);
      records.push({
        "value": 0,
        "day": toStringByFormatting(fromDate)
      });

      fromDate.setDate(fromDate.getDate() + 1);
    }

    // 집중시간 데이터 입력
    if (row.length > 0) {
      console.log(`[userController] setWeekRecords, row.length `, row.length);
      for (let record of row) {
        console.log(`[userController] setWeekRecords, record `, record);
        records.forEach(element => {
          //console.log(element)
          if (element.day === toStringByFormatting(record.record_date)) {
            element.value = (record.daily_focus_time/60/60).toFixed(1);
          }
        });
      }
    }

    data.weekRecords = records
    console.log("[userController] setWeekRecords, data :", data);
  });
}

const setMonthRecords = async (userIdx, data, connection) => {
  console.log(`[userController] setMonthRecords`);
  let fromDate = new Date();
  let now = new Date();

  fromDate.setMonth(fromDate.getMonth() - 1)
  let from = toStringByFormatting(fromDate)
  let to = toStringByFormatting(now)
  let param = [userIdx, from, to]
  await connection.query(selectFocusTimeRecordQuery, param, (err, row) => {
    if (err) {
      console.log(`[userController] setMonthRecords Error `, err);
      res.send(err);
      return;
    }

    let records = [];
    // day 데이터 세팅
    while (fromDate <= now) {
      console.log(`${TAG} fromDate:`, fromDate);
      console.log(`${TAG} nowDate:`, now);
      records.push({
        "value": 0,
        "day": toStringByFormatting(fromDate) 
      });
      fromDate.setDate(fromDate.getDate() + 1);
    }

    // 집중시간 데이터 입력
    if (row.length > 0) {
      console.log(`[userController] setMonthRecords, row.length `, row.length);
      for (let record of row) {
        console.log(`[userController] setMonthRecords, record `, record);
        records.forEach(element => {
          //console.log(`${TAG} element :`, element);
          
          if (element.day === toStringByFormatting(record.record_date)) {
            element.value = (record.daily_focus_time / 60 / 60).toFixed(1);
          }
        });
      }

      for (let record of records) {
        // 년-월-일 중에, '일'만 대입하여 클라이언트측에 전달한다.
        record.day = record.day.split("-")[2];
      }
    }

    data.monthRecords = records
    console.log(`[userController] setMonthRecords, data :`, data);
  });
}

const setYearRecords = async (userIdx, data, connection, res) => {
  console.log(`[userController] setYearRecords`);
  let fromDate = new Date();
  let now = new Date();

  // 당일로부터 1년전 기간까지의 날짜 범위를 지정하는 코드
  // 현재는 올 해 까지만 범위를 지정하는게 좋을 것 같아서 주석처리
  // fromDate.setFullYear(fromDate.getFullYear() - 1)
  // let from = toStringByFormatting(fromDate)

  let from = now.getFullYear() + "-01-01"
  let to = toStringByFormatting(now)
  let param = [userIdx, from, to]
  console.log(`${TAG} from!!`,from);
  console.log(`${TAG} to!!`,to);
  await connection.query(selectFocusTimeRecordQuery, param, (err, row) => {
    if (err) {
      console.log(`[userController] setYearRecords Error `, err);
      res.send(err);
      return;
    }

    let records = []
    if (row.length > 0) {
      console.log(`[userController] setMonthRecords, row.length `, row.length);
      for (let record of row) {
        //console.log(`[userController] setYearRecords, record `, record);

        records.push({
          "value": (record.daily_focus_time / 60 / 60).toFixed(1), 
          "day": toStringByFormatting(record.record_date)
        });
      }
    }

    data.yearRecords = records;
    data.fromYear = from;
    data.toYear = to;
    console.log(`[userController] setYearRecords, data :`, data);
  
    res.send(data);
  });
}

