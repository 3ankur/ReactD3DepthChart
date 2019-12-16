import React, { useEffect, useRef,useState,useContext } from "react";
//import ReactDOM from "react-dom";
import * as d3 from "d3";
import liveData from "../newDataSet.json";
import "./chart.css";

console.log(liveData);


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
const StepChart = (props)=>{


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

    useEffect(()=>{
        drawChart();
    },[])

    const drawChart = ()=>{


        for(let e of liveData.slice(0,1)){

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

       
         let margin = {
               top: 20,
               right: 20,
               bottom: 30,
               left: 50
             },
             width = 960 - margin.left - margin.right,
             height = 500 - margin.top - margin.bottom;
        
      

             x = d3.scaleLinear().range([0, width]);
             y = d3.scaleLinear().range([height, 0]);
             y1 = d3.scaleLinear().range([height, 0]);

             xAxis = d3.axisBottom(x)
            .ticks(20)
            .tickSize(5)
            .tickPadding(1);

            yAxis = d3.axisLeft(y)


           
            x.domain([
                d3.min(mainMergedData, d => d.value),
                d3.max(mainMergedData, d => d.value) + 1,
                ]);
            y.domain([0, d3.max(mainMergedData, d => d.totalvolume)]);

        

            
     
        
      
        
        /*let line = d3.svg.line().interpolate("step-after")
                        .x(d => x(d.start_date))
                        .y(d => y(d.points));*/
        
        let line = "M",
            fill = `M0,${height}`;
        
        let svg = d3.select("#chart").append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                  .attr("transform", `translate(${margin.left},${margin.top})`);



                //   for(let excType in mainObj){
                //     let bids = mainObj[excType]["bids"]; 
                //     let asks = mainObj[excType]["asks"]; 
                
                // }

        
        mainMergedData.forEach((d, i) => {
          let y0 = y(d.totalvolume),
              x0 = x(d.value);
          if (i === 0) {
            line += `${x(d.value)},${y0}H${x0}`;
          } else {
            line += `H${x0}`;
          }
          
          fill += `V${y0}H${x0}`;
        
          if (mainMergedData[i + 1]) {
            line += `V${y(mainMergedData[i + 1].totalvolume)}`;
          }
        });
        
        fill += `V${height}Z`;
        
        console.log(fill);
        
        
       // let avg = d3.mean(data, d => d.points);
        
        // x.domain([d3.min(data, function(d) { return d.start_date}), new Date()]);
        
        
        svg.append("g")
          .attr("class", "x axis")
          .attr("transform", `translate(0,${height})`)
          .call(xAxis);
        
        svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
          .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Points");
        
        svg.append("path")
          .attr("class", "line")
          .attr("d", line);
        
        svg.append("path")
          .attr("class", "path-fill")
          .attr("d", fill);
        
        /*svg.selectAll(".line")
          .data(data)
          .enter().append("line")
          .attr("class", "line")
          .attr("x1", d => x(d.start_date))
          .attr("x2", d => x(d.end_date))
          .attr("y1", d => y(d.points))
          .attr("y2", d => y(d.points));*/
        
        // svg.append("line")
        //   .attr("class", "avg-line")
        //   .attr("x1", 0)
        //   .attr("x2", width)
        //   .attr("y1", y(avg))
        //   .attr("y2", y(avg));
        
        let focus = svg.append("g")
                      .attr("class", "tooltip")
                      .style("display", "none");
        
        focus.append("circle")
          .attr("class", "tooltip-point")
          .attr("r", 6);
        
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
          .attr("width", width)
          .attr("height", height)
          .style("fill", "none")
          .style("pointer-events", "all")
          .on("mouseover", () => focus.style("display", null))
          .on("mouseout", () => focus.style("display", "none"))
          .on("mousemove", mousemove);
        
        function mousemove() {
            bisectDate = d3.bisector(d => d.value).left;
          let x0 = x.invert(d3.mouse(this)[0]),
              i = bisectDate(mainMergedData, x0, 1),
              d0 = mainMergedData[i - 1],
              d1 = mainMergedData[i];
        
          let d = typeof d1 !=="undefined" && x0 - d0.value > d1.value - x0 ? d1 : d0;
          
          focus.select("circle.tooltip-point")
            .attr("transform",`translate(${d3.mouse(this)[0]},${y(d.totalvolume)})`);
          
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
          
       //   focus.select("text.x1").text(formatDate(d.value));
          
        //  focus.select("text.x2").text(formatDate(d.value));
        }

    }

    return(
            <div>
                <div id="chart"></div>
            </div>
    );

}

export default StepChart;