import React, { useEffect, useRef } from "react";
//import ReactDOM from "react-dom";
import * as d3 from "d3";
import liveData from "./multipalExchanges.json";
import "./chart.css";
console.log(liveData);
const DepthChartExchanges = props => {
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


  // const getDepthBinance = ()=>{
  //   window.fetch("https://www.binance.com/api/v1/depth?limit=500&symbol=BTCUSDT")
  //   .then((res)=>res.json())
  //   .then((data)=>{
  //     console.log("updaed data",data);
  //   })
  // }


  // setInterval(() => {
  //    getDepthBinance();
  // }, 5000);

 

  useEffect(
    () => {
      drawChart();
    },
    [props.data]
  );

   const drawChart =() =>{

    let legendColor = ["#6a00ff","#69b3a2","#5600HH"];
    let width = 950;
    let height= 400;

    const colorCodeObj = {
      "binance":{
        "bid":"#6a00ff",
        "ask":"#ab0000"
      },
      "bitfinix":{
        "bid":"#69b3a2",
        "ask":"#fc5857"
      },
      "okex":{
        "bid":"#69b3a2",
        "ask":"#fc5857"
      }
    }
     
    let mainObj= {};
    let mainMergedData = [];
    const exchangesList = Object.keys(liveData.result);
    for(let e of exchangesList){
        mainObj[e] = {};
        mainObj[e]["bids"] =  processData(liveData.result[e]["bids"], "bids", true);
        mainObj[e]["asks"] = processData(liveData.result[e]["asks"], "asks", false);
        mainMergedData = [...mainObj[e]["bids"],...mainObj[e]["asks"]];
    }

    console.log("bhai its the updated main object",mainObj);
    console.log("Poora merged object",mainMergedData);
    
console.log("bhai upated data check karo....!");
    
let  bisectDate = d3.bisector(d => d.value).left;
let margin = {top: 20, right: 30, bottom: 40, left: 90};
const x = d3.scaleLinear().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);
const y1 = d3.scaleLinear().range([height, 0]);

let svg = d3.select(".depthChartExchanges")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

    const g = svg.append('g');
    x.domain([
        d3.min(mainMergedData, d => d.value),
        d3.max(mainMergedData, d => d.value) + 1,
        ]);
    y.domain([0, d3.max(mainMergedData, d => d.totalvolume)]);
        g.append('g')
        .attr('class', 'axis axis--y')
        .call(d3.axisLeft(y));
        g.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x));    

    //appening by category
    for(let excType in mainObj){

        let bids = mainObj[excType]["bids"]; 
        let asks = mainObj[excType]["asks"]; 

        g.append("path")
        .datum(bids)
        .attr("fill", colorCodeObj[excType]["bid"])
        .attr("class",(d)=>`${excType}_bid all_bid`)
        .attr("fill-opacity", .3)
        .attr("stroke", "none")
        .attr("d", d3.area()
        .x(function(d) { return x(d.value) })
        .y0( height )
        .y1(function(d) { return y(d.totalvolume) })
        )


// var defs = g.append("defs");
// var gradient = defs.append("linearGradient")
//    .attr("id", "svgGradient")
//    .attr("x1", "0%")
//    .attr("x2", "100%")
//    .attr("y1", "0%")
//    .attr("y2", "100%");

// gradient.append("stop")
//    .attr('class', 'start')
//    .attr("offset", "0%")
//    .attr("stop-color", "#00b088")
//    .attr("stop-opacity", 1);

// gradient.append("stop")
//    .attr('class', 'end')
//    .attr("offset", "100%")
//    .attr("stop-color", "#b5ffee")
//    .attr("stop-opacity", 1);


      g.append("path")
      .datum(bids)
      .attr("fill", "none")
       .attr("stroke", colorCodeObj[excType]["bid"])
      .attr("class",(d)=>`${excType}_bid all_bid`)
      .attr("stroke-width", 1)
      //.attr("stroke", "url(#svgGradient)")
      .attr("d", d3.line()
      .x(function(d) { return x(d.value) })
      .y(function(d) { return y(d.totalvolume) })
      )

      //define new gradient
      
      //end gradient
  
      g.append("path")
        .datum(asks)
        .attr("fill", colorCodeObj[excType]["ask"])
        .attr("class",(d)=>`${excType}_bid all_bid`)
        .attr("fill-opacity", .3)
        .attr("stroke", "none")
        .attr("d", d3.area()
        .x(function(d) { return x(d.value) })
        .y0( height )
        .y1(function(d) { return y(d.totalvolume) })
        )
        
      g.append("path")
      .datum(asks)
      .attr("fill", "none")
      .attr("stroke", colorCodeObj[excType]["ask"])
      .attr("class",(d)=>`${excType}_bid all_bid`)
      .attr("stroke-width", 1)
      .attr("d", d3.line()
      .x(function(d) { return x(d.value) })
      .y(function(d) { return y(d.totalvolume) })
      )

     // if("binance" === excType ){
    }//end of exchanges itration

    //adding legend for exchanges

    var legend = svg.append("g")
    .attr("class", "legend")
    .attr("id","ad")
    .attr('transform', `translate(740,${380})`);
    
     legend.selectAll('#exchangeLegend')
    .data(exchangesList)
    .enter()
    .append("rect")
    .attr("x", function(d, i){ return i *  100;})
    .attr("y", 50)
    .attr("width", 10)
    .attr("height", 10)
    .style("fill",function(d,i){return legendColor[i];});
    
    var texts = legend.selectAll('text')
    .data(exchangesList)
    .enter()
    .append("text")
    .attr("x", function(d, i){ return i *  100 + 15;})
    .attr("y",60)
    .attr("class", function(d){return d+"_legend"})
    .text(function(d,i){ return exchangesList[i];})
    
    texts.on("click", function(elemData){

      
   // console.log(elemData, console.log( d3.selectAll(".BID")));
    d3.selectAll(".all_ask").style("opacity", 0.01)
    d3.selectAll(".all_bid").style("opacity", 0.01)
    d3.selectAll("."+elemData+"_ask").style("opacity", 3)
    d3.selectAll("."+elemData+"_bid").style("opacity", 3)
   // d3.select("#bitfinex_over").style("display", "none");

   //_legend

   d3.selectAll(elemData+"_legend").attr("color","#CCC")


   //exchangesList

    d3.select("#"+elemData+"_mover").remove();
    d3.select("#"+elemData+"_mcover").remove();
    
   //for mousemove
let focus = svg.append("g")
.attr("id",elemData+"_mover")
.attr("class", "tooltip")
.style("display", "none");

focus.append("circle")
.attr("id","left_circle")
.attr("class", "tooltip-point")
.attr("r", 5);


focus.append("circle")
.attr("id","right_circle")
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
.attr("id",elemData+"_mcover")
.attr("width", width)
.attr("height", height)
.style("fill", "none")
.style("pointer-events", "all")
.on("mouseover", () => focus.style("display", null))
.on("mouseout", () => focus.style("display", "none"))
.on("mousemove", mousemove);


let tmpMergeArr = [...mainObj[elemData]["bids"],...mainObj[elemData]["asks"]];
//event for mousemove
function mousemove() {

 // console.log("Current THis",this);
  //console.log("Inverted Value",x.invert(d3.mouse(this)[0]));
let x0 = x.invert(d3.mouse(this)[0]),
i = bisectDate(tmpMergeArr, x0, 1),
d0 = tmpMergeArr[i - 1],
d1 = tmpMergeArr[i];

let d = typeof d1 !=="undefined" && x0 - d0.value > d1.value - x0 ? d1 : d0;

focus.select("circle.tooltip-point")
.attr("transform",`translate(${x(d.value)},${y(d.totalvolume)})`);

 console.log(x0,d);
 console.log("check it for cordinate");

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

//end mousemove
    //  }
//end mousemove


    })
    
    .on('mouseover', function(elemData){
    //  console.log(elemData);
    //   d3.selectAll(".all_ask").style("opacity", 0.01)
    //   d3.selectAll(".all_bid").style("opacity", 0.01)
    //   d3.selectAll("."+elemData+"_ask").style("opacity", 3)
    //   d3.selectAll("."+elemData+"_bid").style("opacity", 3)
    })
        
    // .on('mouseout', function(d){
    //  d3.selectAll(".all_ask").style("opacity", 3)
    //   d3.selectAll(".all_bid").style("opacity",3)
    // });
    


   }

  return (
    <div className="depthChartExchanges"></div>
  );
};

export default DepthChartExchanges;