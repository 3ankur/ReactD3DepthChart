import React from "react";
import * as d3 from "d3";
import "./chart.css";

class Test6 extends React.Component{
    constructor(){

    }

    componentDidMount(){

        let data = [{
            price: 30,
            points: 46.44
          },{
            price: 35,
            points: 52.37
          },{
            price: 40,
            points: 41.63
          },{
            price: 50,
            points: 55.35
          },{
            price: 55,
            points: 47.51
          },{
            price: 60,
            points: 56.55
          },{
            price: 65,
            points: 45.74
          },{
            price: 70,
            points: 54.79
          },{
            price: 80,
            points: 48.86
          },{
            price: 90,
            points: 47.6
          },{
            price: 110,
            points: 48.04
        }];
        
         let margin = {
               top: 20,
               right: 20,
               bottom: 30,
               left: 50
             },
             width = 960 - margin.left - margin.right,
             height = 500 - margin.top - margin.bottom;
        
        let parseDate = d3.time.format("%Y-%m-%d").parse,
            bisectDate = d3.bisector(d => d.start_date).left,
            formatDate = d3.time.format("%d %b, %y"),
            x = d3.time.scale().range([0, width]),
            y = d3.scale.linear().range([height, 0]),
            xAxis = d3.svg.axis().scale(x)
                      .orient("bottom")
                      .ticks(d3.time.sunday, 1)
                      .tickSize(-height, 0, 0)
                      .tickFormat(d => formatDate(d)),
            yAxis = d3.svg.axis().scale(y)
                    .orient("left")
                    .ticks(6)
                    .tickSize(-width, 0, 0)
                    .tickFormat(d => d);
        
        data.forEach((d, i) => {
          d.start_date = parseDate(d.start_date);
          d.end_date = parseDate(d.end_date);
        });
        
        x.domain([
          d3.min(data, d => d.start_date),
          d3.max(data, d => d.end_date)
        ]);
        y.domain([30, 60]);
        
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
        
        data.forEach((d, i) => {
          let y0 = y(d.points),
              x0 = x(d.end_date);
          if (i === 0) {
            line += `${x(d.start_date)},${y0}H${x0}`;
          } else {
            line += `H${x0}`;
          }
          
          fill += `V${y0}H${x0}`;
        
          if (data[i + 1]) {
            line += `V${y(data[i + 1].points)}`;
          }
        });
        
        fill += `V${height}Z`;
        
        console.log(fill);
        
        
        let avg = d3.mean(data, d => d.points);
        
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
        
        svg.append("line")
          .attr("class", "avg-line")
          .attr("x1", 0)
          .attr("x2", width)
          .attr("y1", y(avg))
          .attr("y2", y(avg));
        
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
          let x0 = x.invert(d3.mouse(this)[0]),
              i = bisectDate(data, x0, 1),
              d0 = data[i - 1],
              d1 = data[i];
        
          let d = typeof d1 !=="undefined" && x0 - d0.strat_date > d1.start_date - x0 ? d1 : d0;
          
          focus.select("circle.tooltip-point")
            .attr("transform",`translate(${d3.mouse(this)[0]},${y(d.points)})`);
          
          focus.select("text.y1")
            .attr("transform", "translate("+ d3.mouse(this)[0] + "," + y(d.points) + ")");
          
          focus.select("text.x1")
            .attr("transform", "translate("+ x(d.start_date) + "," + ((height + y(d.points))/2) + ") rotate(-90)");
          
          focus.select("text.x2")
            .attr("transform", "translate("+ x(d.end_date) + "," + ((height + y(d.points))/2) + ") rotate(-90)");
          
          focus.select("line.tooltip-start-date")
            .attr("y2", y(d.points))
            .attr("x1", x(d.start_date))
            .attr("x2", x(d.start_date));
          
          focus.select("line.tooltip-end-date")
            .attr("y2", y(d.points))
            .attr("x1", x(d.end_date))
            .attr("x2", x(d.end_date));
          
          focus.select("line.tooltip-mileage")
            .attr("y1", y(d.points))
            .attr("y2", y(d.points));
          
          focus.select("text.y1").text(d.points);
          
          focus.select("text.x1").text(formatDate(d.start_date));
          
          focus.select("text.x2").text(formatDate(d.end_date));
        }
    }

    render(){
        return(
            <div id="chart"></div>
        )
    }
}



export default Test6;