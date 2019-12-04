import React, { useEffect, useRef } from "react";
//import ReactDOM from "react-dom";
import * as d3 from "d3";
//import liveData from "./liveData.json";
import liveData from "./liveDataNew.json";
import "./chart.css";
console.log(liveData);
const DepthChart = props => {
  const ref = useRef(null);
  const  processData = (list, type, desc) =>{
    var res = [];
    // Convert to data points
    for(var i = 0; i < list.length; i++) {
      list[i] = {
        value: Number(list[i][0]),
        volume: Number(list[i][1]),
      }
    }

    // Sort list just in case
    list.sort(function(a, b) {
      if (a.value > b.value) {
        return 1;
      }
      else if (a.value < b.value) {
        return -1;
      }
      else {
        return 0;
      }
    });

    // Calculate cummulative volume
    if (desc) {
      for(var i = list.length - 1; i >= 0; i--) {
        if (i < (list.length - 1)) {
          list[i].totalvolume = list[i+1].totalvolume + list[i].volume;
        }
        else {
          list[i].totalvolume = list[i].volume;
        }
        var dp = {};
        dp["value"] = list[i].value;
        dp[type + "volume"] = list[i].volume;
      //  dp[type + "totalvolume"] = list[i].totalvolume;
        dp["totalvolume"] = list[i].totalvolume;
        
      res.unshift(dp);
      }
    }
    else {
      for(var i = 0; i < list.length; i++) {
        if (i > 0) {
          list[i].totalvolume = list[i-1].totalvolume + list[i].volume;
        }
        else {
          list[i].totalvolume = list[i].volume;
        }
        var dp = {};
        dp["value"] = list[i].value;
        dp[type + "volume"] = list[i].volume;
      //  dp[type + "totalvolume"] = list[i].totalvolume;
      dp["totalvolume"] = list[i].totalvolume;
        res.push(dp);
      }
    }

      return res;

  }

 

  useEffect(
    () => {
     
      drawChart();


    },
    [props.data]
  );

   const drawChart =() =>{
    let width = 950;
    let height= 400;

    const colorCodeObj = {
      "binance":{
        "bid":"#6a00ff",
        "ask":"#ab0000"
      },
      "bitfinex":{
        

        "bid":"#69b3a2",
        "ask":"#fc5857"

      }
    }
     
  
    
   let currentBidsData =  processData(liveData.result.bids, "bids", true);
   let currentAsksData =  processData(liveData.result.asks, "asks", false);

   var mergedData = [...currentBidsData,...currentAsksData] ; //[...liveData.result.bids,...liveData.result.asks];

console.log(currentBidsData);
console.log(currentAsksData);
    console.log("bhai upated data check karo....!");
    
  let  bisectDate = d3.bisector(d => d.value).left;

    let margin = {top: 20, right: 30, bottom: 40, left: 90};
    // ,
    // width = width - margin.left - margin.right,
    // height = height- margin.top - margin.bottom;

      const x = d3.scaleLinear().range([0, width]);
      const y = d3.scaleLinear().range([height, 0]);
      const y1 = d3.scaleLinear().range([height, 0]);

      let svg = d3.select(".depthChartNew")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

    const g = svg.append('g')
  //  .attr("transform", "translate(" + margin.left + ","+ margin.top + ")");

    console.log("its the minimal value",d3.min(mergedData, d => d[1]));

      x.domain([
      d3.min(mergedData, d => d.value),
      d3.max(mergedData, d => d.value) + 1,
      ]);

      console.log("max  value",d3.max(mergedData, d => d[1]));

      //.tickValues(d3.range(minValue, maxValue + step, step))
      y.domain([0, d3.max(mergedData, d => d.totalvolume)]);

      g.append('g')
      .attr('class', 'axis axis--y')
      .call(d3.axisLeft(y))


      // Add the Y1 Axis
      // svg.append("g")
      // .attr("class", "axisRed")
      // .attr("transform", "translate( " + parseInt(width) +", 0 )")
      // .call(d3.axisRight(y));

      g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));


   //   let updatedBid = liveData.result.bids.sort((a,b)=>a[0]-b[0]) ;
// console.log("its updated ",updatedBid);
      g.append("path")
      .datum(currentBidsData)
      .attr("fill", colorCodeObj["binance"]["bid"])
      .attr("class",(d)=>`${1}_bid all_bid`)
      .attr("fill-opacity", .3)
      .attr("stroke", "none")
      .attr("d", d3.area()
      .x(function(d) { return x(d.value) })
      .y0( height )
      .y1(function(d) { return y(d.totalvolume) })
      )
      
    g.append("path")
    .datum(currentBidsData)
    .attr("fill", "none")
    .attr("stroke", colorCodeObj["binance"]["bid"])
    .attr("class",(d)=>`${1}_bid all_bid`)
    .attr("stroke-width", 1)
    .attr("d", d3.line()
    .x(function(d) { return x(d.value) })
    .y(function(d) { return y(d.totalvolume) })
    )
    .on("mouseover", function(d) {
      //console.log(d,this,d3.event);
    })


    //let updatedAsk = liveData.result.asks.sort((a,b)=>a[0]-b[0]) ;

    g.append("path")
      .datum(currentAsksData)
      .attr("fill", colorCodeObj["binance"]["ask"])
      .attr("class",(d)=>`${1}_bid all_bid`)
      .attr("fill-opacity", .3)
      .attr("stroke", "none")
      .attr("d", d3.area()
      .x(function(d) { return x(d.value) })
      .y0( height )
      .y1(function(d) { return y(d.totalvolume) })
      )
      
    g.append("path")
    .datum(currentAsksData)
    .attr("fill", "none")
    .attr("stroke", colorCodeObj["binance"]["ask"])
    .attr("class",(d)=>`${1}_bid all_bid`)
    .attr("stroke-width", 1)
    .attr("d", d3.line()
    .x(function(d) { return x(d.value) })
    .y(function(d) { return y(d.totalvolume) })
    )
    .on("mouseover", function(d) {
      //console.log(d,this,d3.event);
    })


let focus = svg.append("g")
.attr("class", "tooltip")
.style("display", "none");

focus.append("circle")
.attr("class", "tooltip-point")
.attr("r", 5);

focus.append("text")
.attr("class", "y1")
.attr("dx", "-2em")
.attr("dy", "-.75em");

focus.append("line")
.attr("class", "tooltip-line tooltip-start-date")
.attr("y1", height)
.attr("y2", height);

focus.append("line")
.attr("class", "tooltip-line tooltip-end-date")
.attr("y1", height)
.attr("y2", height);

focus.append("line")
.attr("class", "tooltip-line tooltip-mileage")
.attr("x1", 0)
.attr("x2", width)
.attr("y1", height)
//.attr("y2", height);

focus.append("text")
.attr("class", "x1")
.attr("dx", "-4.5em")
.attr("dy", "-.5em")
.attr("transform", "rotate(90)");

focus.append("text")
.attr("class", "x2")
.attr("dx", "-4.5em")
.attr("dy", "-.5em");

svg.append("rect")
.attr("width", width)
.attr("height", height)
.style("fill", "none")
.style("pointer-events", "all")
.on("mouseover", () => focus.style("display", null))
.on("mouseout", () => focus.style("display", "none"))
.on("mousemove", mousemove);

function mousemove() {
  console.log("Inverted Value",x.invert(d3.mouse(this)[0]));
let x0 = x.invert(d3.mouse(this)[0]),
i = bisectDate(mergedData, x0, 1),
d0 = mergedData[i - 1],
d1 = mergedData[i];

let d = typeof d1 !=="undefined" && x0 - d0.value > d1.value - x0 ? d1 : d0;

console.log(d);

console.log("mouse value",d3.mouse(this));
focus.select("circle.tooltip-point")
.attr("transform",`translate(${x(d.value)},${y(d.totalvolume)})`);

//d3.mouse(this)[0]  y(d.totalvolume)

// totalvolume: 1395.869507589997
// value: 6928.6


focus.select("text.y1")
.attr("transform", "translate("+ d3.mouse(this)[0] + "," + y(d.totalvolume) + ")");

focus.select("text.x1")
.attr("transform", "translate("+ x(d.value) + "," + ((height + y(d.totalvolume))/2) + ") rotate(-90)");

focus.select("text.x2")
.attr("transform", "translate("+ x(d.value) + "," + ((height + y(d.totalvolume))/2) + ") rotate(-90)");

focus.select("line.tooltip-start-date")
.attr("y2", y(d.totalvolume))
.attr("x1", x(d.value))
.attr("x2", x(d.value));

focus.select("line.tooltip-end-date")
.attr("y2", y(d.totalvolume))
.attr("x1", x(d.value))
.attr("x2", x(d.value));

focus.select("line.tooltip-mileage")
.attr("y1", y(d.totalvolume))
.attr("y2", y(d.totalvolume));

focus.select("text.y1").text(d.totalvolume);

focus.select("text.x1").text(d.value);

focus.select("text.x2").text(d.value);


}

   }

  return (
    <div className="depthChartNew">

    </div>
    // <svg width={props.width} height={props.height}>
    //   <g
    //     ref={ref}
    //     transform={`translate(${props.outerRadius} ${props.outerRadius})`}
    //   />
    // </svg>
  );
};

export default DepthChart;