import "routes/Record.css"
import React, { useState, useEffect } from "react";
import { ResponsiveCalendar } from '@nivo/calendar'

const CalendarRecordChart = (chartData) => {

  useEffect(() => {
    console.log("[CalendarRecordChart] chartData :", chartData);
    console.log("[CalendarRecordChart] chartData.chartData :", chartData.chartData);
    console.log("[CalendarRecordChart] chartData.chartData.yearRecords :", chartData.chartData.yearRecords);
    console.log("[CalendarRecordChart] chartData.chartData.fromYear :", chartData.chartData.fromYear);
    console.log("[CalendarRecordChart] chartData.chartData.toYear :", chartData.chartData.toYear);
  }, []);
  
  return (
    <div className="chart" style={{ width:1000, height: 300 }}>
      <ResponsiveCalendar
          data={chartData.chartData.yearRecords}
          from={chartData.chartData.fromYear}
          to={chartData.chartData.toYear}
          emptyColor="#eeeeee"
          // colors={['#61cdbb', '#97e3d5', '#e8c1a0', '#f47560']} 
          // colors={['#9BE9A8', '#40C463', '#30A14E', '#216E39' ]}
          colors={['#9BE9A8', '#40C463', '#216E39', '#f47560' ]}
          minValue="auto"
          margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
          yearSpacing={40}
          monthBorderColor="#ffffff"
          dayBorderWidth={2}
          dayBorderColor="#ffffff"
          legends={[
            {
              anchor: 'bottom-right',
              direction: 'row',
              translateY: 36,
              itemCount: 5,
              itemWidth: 42,
              itemHeight: 36,
              itemsSpacing: 14,
              itemDirection: 'right-to-left'
            }
          ]}
        />
    </div>
  );
};
export default CalendarRecordChart;