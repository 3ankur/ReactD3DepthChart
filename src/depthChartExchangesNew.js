import React, { useEffect, useRef,useState,useContext } from "react";
//import ReactDOM from "react-dom";
import * as d3 from "d3";
import liveData from "./newDataSet.json";
import "./chart.css";
import InputRange from 'react-input-range';
import "react-input-range/lib/css/index.css";
//console.log(liveData);

let gX,gY,gY1,xAxis,yAxis,x,y,y1,svg,yAxis1;
let mainObj= {};
let exchangesList= [];
let mainMergedData = [];
let exchangeMinMax = {};
let width = 950;
let height= 400;
let  bisectDate ;
let colorCodeObj;
let tooltip,tooltipLine,singleToolTipMergeArr ; 

const DepthChartExchanges = props => {
//console.log("Calling again ");
 


  const updateChart = ()=>{


          const refDataSet = [...liveData];
          mainMergedData = [];
          exchangesList=[];
          for(let e of refDataSet){

          mainObj[e.exchange] = {};
          mainObj[e.exchange]["bids"] =  processData(e["bids"], "bids", true);
          mainObj[e.exchange]["asks"] = processData(e["asks"], "asks", false);
          let currentMergeObj = [...mainObj[e.exchange]["bids"],...mainObj[e.exchange]["asks"]];
          mainMergedData = mainMergedData.concat(currentMergeObj) ;
          exchangesList.push(e.exchange);

          exchangeMinMax[e.exchange] = {};
          exchangeMinMax[e.exchange]["min"] = Math.round(d3.min(currentMergeObj, d => d.value));
          exchangeMinMax[e.exchange]["max"] = Math.round(d3.max(currentMergeObj, d => d.value))
          }

          let minV = Math.round(d3.min(mainMergedData, d => d.value));
          let maxV = Math.round(d3.max(mainMergedData, d => d.value));


          y.domain([0, d3.max(mainMergedData, d => d.totalvolume)]);
          y1.domain([0, d3.max(mainMergedData, d => d.totalvolume)]);

          //gY.call(yAxis.scale(d3.event.transform.rescaleY(y)));
          // gY1.call(yAxis.scale(d3.event.transform.rescaleY(y)));

          setMinValue(minV);
          setMaxValue(maxV);

         // setSilderValue({min:minV,max:maxV});
          
      //    svg.selectAll(".tooltip-spc").remove();
      //    svg.selectAll(".tooltip-point").remove();

          x.domain([minV-1, maxV+1]);
          svg.select(".axis--x").call(xAxis);
          svg.select(".axis-right-y").call(yAxis);//yAxis1
          svg.select(".axis--y").call(yAxis1);
    
          for(let info of refDataSet){
        //  console.log("its the infi",info);
       //   d3.selectAll("."+info.exchange+"_ask").style("opacity", 3)
        //  d3.selectAll("."+info.exchange+"_bid").style("opacity", 3)

        if(document.getElementById(`${info.exchange}_mcover`)){
          singleToolTipMergeArr = [...mainObj[info.exchange]["bids"],...mainObj[info.exchange]["asks"]];
        }

          svg.selectAll(`.${info.exchange}_bid`)
          .datum(mainObj[info.exchange]["bids"])

          .attr("d", d3.line()
          .x(function(d) { return x(d.value) })
          .y(function(d) { return y(d.totalvolume) })
          )

          svg.selectAll(`.${info.exchange}_bid`)
          .datum(mainObj[info.exchange]["bids"])
          .transition().duration(500)

          .attr("d", d3.area()
          .x(function(d) { return x(d.value) })
          .y0( height )
          .y1(function(d) { return y(d.totalvolume) })
          )
          // .curve(d3.curveCardinal);

          svg.selectAll(`.${info.exchange}_ask`)
          .datum(mainObj[info.exchange]["asks"])
          //.attr("transform", d3.event.transform)
          .transition().duration(500)
          .attr("d", d3.line()
          .x(function(d) { return x(d.value) })
          .y(function(d) { return y(d.totalvolume) })
          )
          svg.selectAll(`.${info.exchange}_ask`)
          .datum(mainObj[info.exchange]["asks"])
          .transition().duration(500)
          .attr("d", d3.area()
          .x(function(d) { return x(d.value) })
          .y0( height )
          .y1(function(d) { return y(d.totalvolume) })
          )
          }
        // updateAllTooltip();
  }


const genrateRandomData = ()=>{

  //Math.floor(Math.random() * (max - min + 1)) + min;

        for(let exc of liveData){

        let askArr = [];
        //asks
        for(let i=0;i<=25;i++){
            // Math.floor(Math.random() * (max - min + 1)) + min;
            // 7500 8000
            // 1 20
            let tmp1 = [
            Math.random() * (7600 - 7500 + 1) + 7500,
            Math.random() * (10 - 1 + 1) + 1
            ];
            askArr.push(tmp1);
        }

        exc.asks = askArr
        let bidArr = [];
        //bid
        //ma 7440  mi 7100
        for(let i=0;i<=25;i++){
          let tmp2 = [
          Math.random() * (7499 - 7400 + 1) + 7400,
          Math.random() * (10 - 1 + 1) + 1
          ];
          bidArr.push(tmp2);
        }
          exc.bids = bidArr;
        }
}
 
  const depthChartRef = useRef(null);
  //console.log(depthChartRef);
 // let minSliderValue = 7300;
  //let maxSliderValue  = 7400;
  const [sliderValue, setSilderValue] = useState({min:6000,max:7350});
  const [minSliderValue,setMinValue] = useState(0);
  const [maxSliderValue,setMaxValue] = useState(100);
  //const [chartData,setChartData] = useState([]);
//get the exchange nearest value
const getNearest = (exc,v)=>{

  let valuesArrMin = [];
  let valuesArrMax = [];
  for(let op in exc){
    valuesArrMin.push( exc[op]["min"]);
   valuesArrMax.push(exc[op]["max"]);
  }


let closestMin = valuesArrMin.reduce(function(prev, curr) {
  return (Math.abs(curr - v.min) < Math.abs(prev - v.min) ? curr : prev);
});

let closestMax = valuesArrMax.reduce(function(prev, curr) {
  return (Math.abs(curr - v.max) < Math.abs(prev - v.max) ? curr : prev);
});

//.log(closest);
  let  currentActive = [];
for(let op in exc){
  if( (exc[op]["min"]-v["min"])>=0 && exc[op]["min"]>=closestMin && exc[op]["max"]<=closestMax){
 //   currentActive = op;
 currentActive.push(op);
  }
}
return {
  min:closestMin,
  max:closestMax,
  excList :currentActive
}

}

  const zoomWithSlider = (data)=>{
   // console.log("current slider",data);
   // console.log("updation ",exchangeMinMax);
   
    x.domain([data.min-1, data.max+1]);
    svg.select(".axis--x").call(xAxis);
   
    let near = getNearest(exchangeMinMax,data);

    d3.selectAll(".all_ask").style("opacity", 0.1)
    d3.selectAll(".all_bid").style("opacity", 0.1)
    d3.selectAll(".exc_info").style("opacity", 0.1)
    
    //console.log(near);

    //near.excList
   // if(near.excList.length){
      for(let info of exchangesList){
        d3.selectAll("."+info+"_ask").style("opacity", 3)
        d3.selectAll("."+info+"_bid").style("opacity", 3)

        svg.selectAll(`.${info}_bid`)
        .datum(mainObj[info]["bids"])
        .attr("d", d3.line()
        .x(function(d) { return x(d.value) })
        .y(function(d) { return y(d.totalvolume) })
        )
  
        svg.selectAll(`.${info}_bid`)
        .datum(mainObj[info]["bids"])
        .transition().duration(500)
  
        .attr("d", d3.area()
        .x(function(d) { return x(d.value) })
        .y0( height )
        .y1(function(d) { return y(d.totalvolume) })
        )
  
        svg.selectAll(`.${info}_ask`)
        .datum(mainObj[info]["asks"])
        //.attr("transform", d3.event.transform)
        .transition().duration(500)
        .attr("d", d3.line()
        .x(function(d) { return x(d.value) })
        .y(function(d) { return y(d.totalvolume) })
        )
        svg.selectAll(`.${info}_ask`)
        .datum(mainObj[info]["asks"])
        .transition().duration(500)
        .attr("d", d3.area()
        .x(function(d) { return x(d.value) })
        .y0( height )
        .y1(function(d) { return y(d.totalvolume) })
        )
      }
   // }
  }


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

 
  let exCounter = 1;
  useEffect(
    () => {
    console.log("its efect calling");
    drawChart();
   },
    []
  );

   const drawChart =() =>{

    setInterval(()=>{
      genrateRandomData();
     updateChart();
    },10000);

    console.log(depthChartRef);


    // p #F2E5FF #6a00ff
     colorCodeObj = {
        "POLONIEX":{
        "bid":"#6a00ff",
        "ask":"#aaaaaa"
      },
      "BITFINEX":{
        "bid":"#69b3a2",
        "ask":"#fc5857"
      },
      "HITBTC":{
        "bid":"#3c2f2f",
        "ask":"#ffc425"
      }
    }

  //  let mainObj= {};
   // let mainMergedData = [];
   // const exchangesList = Object.keys(liveData.result);
  // let exchangesList= [];
    for(let e of liveData){

        mainObj[e.exchange] = {};
        mainObj[e.exchange]["bids"] =  processData(e["bids"], "bids", true);
        mainObj[e.exchange]["asks"] = processData(e["asks"], "asks", false);
        let currentMergeObj = [...mainObj[e.exchange]["bids"],...mainObj[e.exchange]["asks"]];
        mainMergedData = mainMergedData.concat(currentMergeObj) ;
        exchangesList.push(e.exchange);

      exchangeMinMax[e.exchange] = {};
      exchangeMinMax[e.exchange]["min"] = Math.round(d3.min(currentMergeObj, d => d.value));
      exchangeMinMax[e.exchange]["max"] = Math.round(d3.max(currentMergeObj, d => d.value))
    }

        bisectDate = d3.bisector(d => d.value).left;
      let margin = {top: 100, right: 30, bottom: 40, left: 100};
      x = d3.scaleLinear().range([0, width]);
      y = d3.scaleLinear().range([height, 0]);
      y1 = d3.scaleLinear().range([height, 0]);

 svg = d3.select(".depthChartExchanges")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

   var zoom = d3.zoom()
    .scaleExtent([1, 10])
   .translateExtent([[0, 0], [width, height]])
    .extent([[0, 0], [width, height]])
    .on("zoom", zoomed);//zoomWithSlider  zoomed

  
  //svg.call(zoom)
   //start new axis creation
    xAxis = d3.axisBottom(x)
    //(width + 20) / (height + 2) * 10
   .ticks(20)
   .tickSize(5)
   .tickPadding(1);


    yAxis1 = d3.axisLeft(y1)
    yAxis = d3.axisRight(y)
  //  .ticks(5)
  //  .tickSize(5)
  //  .tickPadding(8 - width);

   //end new axis creation
   //setSilderValue({min: d3.min(mainMergedData, d => d.value),max:d3.max(mainMergedData, d => d.value)})
   let minV = Math.round(d3.min(mainMergedData, d => d.value));
   let maxV = Math.round(d3.max(mainMergedData, d => d.value));

    setMinValue(minV);
    setMaxValue(maxV);

    setSilderValue({min:minV,max:maxV});
    const g = svg.append('g');
    x.domain([
        d3.min(mainMergedData, d => d.value),
        d3.max(mainMergedData, d => d.value) + 1,
        ]);
    y.domain([0, d3.max(mainMergedData, d => d.totalvolume)]);
    y1.domain([0, d3.max(mainMergedData, d => d.totalvolume)]);

      gY1 =    g.append('g')
              .attr('class', 'axis axis--y')
              .call(yAxis1);

      gY = g.append('g')
          .attr('class', 'axis axis--y axis-right-y')
          .attr('transform', `translate(${width+1},0)`)
          .call(yAxis);

      gX =   g.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', `translate(0,${height})`)
            .call(xAxis);    

        //  let infoType = g.append("g")
        //  .attr("transform",`translate(700,${12})`)
          

    //appening by category
    for(let excType in mainObj){
        let bids = mainObj[excType]["bids"]; 
        let asks = mainObj[excType]["asks"]; 

        svg.append("path")
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


      svg.append("path")
      .datum(bids)
      .attr("fill", "none")
      .attr("stroke", colorCodeObj[excType]["bid"])
      .attr("class",(d)=>`${excType}_bid all_bid`)
      .attr("stroke-width", 1)
      //.attr("stroke", "url(#svgGradient)")how to set the opposite side axis in d3 chart
      .attr("d", d3.line()
      .x(function(d) { return x(d.value) })
      .y(function(d) { return y(d.totalvolume) })
      )

      //define new gradient
      

      //end gradient
      svg.append("path")
        .datum(asks)
        .attr("fill", colorCodeObj[excType]["ask"])
        .attr("class",(d)=>`${excType}_ask all_bid`)
        .attr("fill-opacity", .3)
        .attr("stroke", "none")
        .attr("d", d3.area()
        .x(function(d) { return x(d.value) })
        .y0( height )
        .y1(function(d) { return y(d.totalvolume) })
        )
        
      svg.append("path")
      .datum(asks)
      .attr("fill", "none")
      .attr("stroke", colorCodeObj[excType]["ask"])
      .attr("class",(d)=>`${excType}_ask all_bid`)
      .attr("stroke-width", 1)
      .attr("d", d3.line()
      .x(function(d) { return x(d.value) })
      .y(function(d) { return y(d.totalvolume) })
      )

    // infoType.append("text")
    // .attr("class",`${excType}_bid exc_info`)
    // .attr("opacity",0)
    // .attr("x", 119)
    // .attr("y",60)
    // .text("BID")

    //   infoType.append("rect")
    //   .attr("class",`${excType}_bid exc_info`)
    //   .attr("x", 100)
    //   .attr("y", 75)
    //   .attr("width", 10)
    //   .attr("height", 10)
    //   .style("fill",colorCodeObj[excType]["bid"])
    //   .attr("opacity",0)
      

    //   infoType.append("text")
    //   .attr("class",`${excType}_ask exc_info`)
    //   .attr("opacity",0)
    //   .attr("x", 115)
    //   .attr("y",85)
    //   .text("ASK")

    //   infoType.append("rect")
    //   .attr("class",`${excType}_ask exc_info`)
    //   .attr("x", 100)
    //   .attr("y", 50)
    //   .attr("width", 10)
    //   .attr("height", 10)
    //   .style("fill",colorCodeObj[excType]["ask"])
    //   .attr("opacity",0)
     
     // if("binance" === excType ){
    }


    //regarding tooltip
    updateAllTooltip();
    //end toltip


    //end of exchanges itration
    //updating tooltip content 
    //end of tooltip

    function zoomed() {      
        gX.call(xAxis.scale(d3.event.transform.rescaleX(x)));
        gY.call(yAxis.scale(d3.event.transform.rescaleY(y)));
        gY1.call(yAxis.scale(d3.event.transform.rescaleY(y)));
        // x.domain(d3.event.transform.rescaleX(x).domain());
        //focus.select(".axis--x").call(xAxis);

        for(let p in mainObj){
          svg.selectAll(`.${p}_bid`)
          .datum(mainObj[p]["bids"])
          .attr("transform", d3.event.transform)
          //.transition().duration(500)

          svg.selectAll(`.${p}_ask`)
          .datum(mainObj[p]["asks"])
          .attr("transform", d3.event.transform)
          //.transition().duration(500)
        } 
    }
    
    //adding legend for exchanges
    var legend = svg.append("g")
    .attr("class", "legend")
    .attr("id","exchangeLegend")
    .attr('transform', `translate(300,${380})`);

    var zoom = d3.zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([[0, 0], [width, height]])
    .extent([[0, 0], [width, height]])
    .on("zoom", zoomed);

    
     legend.selectAll('#exchangeLegend')
    .data(exchangesList)
    .enter()
    .append("rect")
    .attr("x", function(d, i){ return i *  100-10;})
    .attr("y", 50)
    .attr("width", 10)
    .attr("height", 10)
    .style("fill",function(d,i){return colorCodeObj[d]["bid"]})
    .style("cursor", "pointer")
    .on("click", function(elemData){
     // console.log(elemData);
      updatingHoverEvent(elemData);
      updateWithZoom(null,null,elemData)
    });

    legend.selectAll('#exchangeLegend')
    .data(exchangesList)
    .enter()
    .append("rect")
    .attr("x", function(d, i){ return i *  100 ;})
    .attr("y", 50)
    .attr("width", 10)
    .attr("height", 10)
    .style("fill",function(d,i){ return colorCodeObj[d]["ask"]})
    .style("cursor", "pointer")
    .on("click", function(elemData){
     // console.log(elemData);
      updatingHoverEvent(elemData,this);
      updateWithZoom(null,null,elemData)
    });; 
  
    
    var texts = legend.selectAll('text')
    .data(exchangesList)
    .enter()
    .append("text")
    .attr("x", function(d, i){ return i *  100 + 15;})
    .attr("y",60)
    .attr("id", function(d){return d+"_legend"})
    .attr("class", function(d){return d+"_legend"})
    .text(function(d,i){ return exchangesList[i];})
    .style("cursor", "pointer"); 
    
    texts.on("click", function(elemData){

        // updataChartWithData(elemData);
        updatingHoverEvent(elemData,this);
        updateWithZoom(null,null,elemData)
   //_legend

    })
    .on('mouseover', function(elemData){
    
    }).on('mouseout', function(d){
    });

    function updatingHoverEvent(elemData,refThis){

      for(let cx of exchangesList){
         d3.selectAll(`#${cx}_mcover`).remove();
         d3.selectAll(`#${cx}_mover`).remove();
         if(elemData!=cx){
          document.getElementById(`${cx}_legend`).classList.remove(`active_exchange`);
         }
     }
            
   if(d3.select(refThis).classed("active_exchange")){
    let checkList = d3.selectAll(".active_exchange");  
    if(checkList && checkList.hasOwnProperty("_groups") && checkList["_groups"].length){
      for(let el of checkList["_groups"][0]){
        if(el && el.classList){
          el.classList.remove("active_exchange")
        }
      }
    }
    d3.selectAll(".all_ask").style("opacity", 3);
    d3.selectAll(".all_bid").style("opacity", 3);

    //_mcover
   // updateAllTooltip();
   }else{
      d3.select(refThis).classed("active_exchange", d3.select(refThis).classed("active_exchange") ? false : true);
      d3.selectAll(".all_ask").style("opacity", 0.1)
      d3.selectAll(".all_bid").style("opacity", 0.1)
      d3.selectAll("."+elemData+"_ask").style("opacity", 3);
      d3.selectAll("."+elemData+"_bid").style("opacity", 3);
      d3.selectAll(elemData+"_legend").attr("color","#CCC")
      //exchangesList
      d3.select("#"+elemData+"_mover").remove();
      d3.select("#"+elemData+"_mcover").remove();
    
   //for mousemove   
let focus = svg.append("g")
.attr("id",elemData+"_mover")
.attr("class", "tooltip-spc")
.style("display", "none");

focus.append("circle")
.attr("id","left_circle")
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
.attr("y2", height);

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


//tmpMergeArr
singleToolTipMergeArr = [...mainObj[elemData]["bids"],...mainObj[elemData]["asks"]];
//event for mousemove
function mousemove() {

 // console.log("Current THis",this);
  //console.log("Inverted Value",x.invert(d3.mouse(this)[0]));
let x0 = x.invert(d3.mouse(this)[0]),
i = bisectDate(singleToolTipMergeArr, x0, 1),
d0 = singleToolTipMergeArr[i - 1],
d1 = singleToolTipMergeArr[i];

let d = typeof d1 !=="undefined" && x0 - d0.value > d1.value - x0 ? d1 : d0;

focus.select("circle.tooltip-point")
.attr("transform",`translate(${x(d.value)},${y(d.totalvolume)})`);

 //console.log(x0,d);
 //console.log("check it for cordinate");

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
}

   function updateWithZoom(begin,end,type){

    let minValue =  d3.min([...mainObj[type]["bids"],...mainObj[type]["asks"]], d => d.value)
    let maxValue =  d3.max([...mainObj[type]["bids"],...mainObj[type]["asks"]], d => d.value)

   // setMinValue(minValue);
   // setMaxValue(maxValue);

    setSilderValue({min: Math.round(minValue),max: Math.round(maxValue)});
    x.domain([minValue-1, maxValue+1]);

    svg.select(".axis--x").call(xAxis);

    for(let p in mainObj){

       svg.selectAll(`.${p}_bid`)
      .datum(mainObj[p]["bids"])

      .attr("d", d3.line()
      .x(function(d) { return x(d.value) })
      .y(function(d) { return y(d.totalvolume) })
      )

      svg.selectAll(`.${p}_bid`)
      .datum(mainObj[p]["bids"])
      .transition().duration(500)

      .attr("d", d3.area()
      .x(function(d) { return x(d.value) })
      .y0( height )
      .y1(function(d) { return y(d.totalvolume) })
      )


      svg.selectAll(`.${p}_ask`)
      .datum(mainObj[p]["asks"])
      //.attr("transform", d3.event.transform)
      .transition().duration(500)
      .attr("d", d3.line()
      .x(function(d) { return x(d.value) })
      .y(function(d) { return y(d.totalvolume) })
      )
      svg.selectAll(`.${p}_ask`)
      .datum(mainObj[p]["asks"])
      .transition().duration(500)
      .attr("d", d3.area()
      .x(function(d) { return x(d.value) })
      .y0( height )
      .y1(function(d) { return y(d.totalvolume) })
      )
      } 
   }
   }


   // regarding tooltip
const updateAllTooltip = ()=>{
//d3.selectAll(".react_tooltip").remove();
//d3.selectAll(".line_tooltip").remove();

tooltip = d3.select('#tooltip');
 tooltipLine = svg.append('line');

var tipBox = svg.append('rect')
.attr("class","react_tooltip")
.attr('width', width)
.attr('height', height)
.attr('opacity', 0)
.on('mousemove', drawTooltip)
.on('mouseout', removeTooltip)


function removeTooltip() {
if (tooltip) tooltip.style('display', 'none');
if (tooltipLine) tooltipLine.attr('stroke', 'none');
}

function drawTooltip() {

const xPrice = x.invert(d3.mouse(tipBox.node())[0]);//Math.floor()

//new value changing
let x0 = x.invert(d3.mouse(this)[0]);
//end of that

// mainMergedData.sort((a, b) => {
// return b.history.find(h => h.year == year).population - a.history.find(h => h.year == year).population;
// })  

tooltipLine.attr('stroke', 'black')
.attr("class","line_tooltip")
.attr('x1', x(xPrice))
.attr('x2', x(xPrice))
.attr('y1', 0)
.attr('y2', height);
//console.log(d3.event.pageX );

// tooltipLine.append("circle")
//       .attr("r", 7)
//       .style("stroke", function(d) {
//         return "green";
//       })

tooltip.html(`${xPrice.toFixed(2)}`)
.style('left', d3.event.pageX + 20+"px")
.style('top', d3.event.pageY - 20+"px")
.style('display', 'block')
.selectAll()
.data(liveData).enter()
.append('div')
.attr("class","fullexc_tooltip")
.append("span")
.style('color', d => getExcColor(x0,d)   )
.html( d => { return  d.exchange + ': ' + getExcInfo(x0,d,xPrice)}  );
}
    
    
   function getExcColor(cX0,d){
      let  tmpMergeArr = [...d.bids,...d.asks];
      let i = bisectDate(tmpMergeArr, cX0, 1);
      return i >(tmpMergeArr.length/2)+1 ? colorCodeObj[d.exchange]["ask"] : colorCodeObj[d.exchange]["bid"]
    }

   function getExcInfo(cX0,d,pricePoint){
        let  tmpMergeArr = [...d.bids,...d.asks];
        let i = bisectDate(tmpMergeArr, cX0, 1),
        d0 = tmpMergeArr[i - 1],
        d1 = tmpMergeArr[i];
        let dUpdate = typeof d1 !=="undefined" && cX0 - d0.value > d1.value - cX0 ? d1 : d0;
        return `V: ${dUpdate.volume.toFixed(2)}  Q: ${dUpdate.totalvolume.toFixed(2)}`;
   }

   }


  return (
      <React.Fragment>
     <div>
        <InputRange
      // draggableTrack
        maxValue={maxSliderValue}
        minValue={minSliderValue}
        value={sliderValue}
        step={2}
        onChangeComplete={value => zoomWithSlider(value)} // testMe  zoomWithSlider(value)
        onChange={value => setSilderValue(value) } />

  <div ref={depthChartRef} className="depthChartExchanges"></div>
    <div id='tooltip' style={{"position":"absolute",
                            "backgroundColor":"lightgray",
                            "padding":"10px",
                            fontSize: "12px",
                            background:"#fcfcfc",
                            border:"1px solid #ccc"
                        }}></div>
        </div>
    
                        </React.Fragment>
  );
};

export default DepthChartExchanges;