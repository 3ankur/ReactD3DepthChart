import React , { useRef, useEffect }  from "react";
import * as d3 from 'd3';

var text=["binance","bitfinex"];
var color=['#69b3a2','#00FF7F','# #84c2fa',"#bd31ff"];

function D3Component({ id, jsonData, width = 950, height = 500 }) {
    useEffect(() => {

if(jsonData){
  const colorCodeObj = {
    "binance":{
      "bid":"#69b3a2",
      "ask":"#fc5857"
    },
    "bitfinex":{
      "bid":"#00FF7F",
      "ask":"#F4A460"
    }
  }

 const   bisectDate = d3.bisector(function(d) { console.log(d); return d.date; }).left;

  const exchangesType = Object.keys(jsonData);
      let allData = [];

      for(let exc of exchangesType){
     //   console.log(exchangesType[exc]);
         allData = allData.concat(jsonData[exc]);
      }


   const data = allData.sort((a, b) => (a.price > b.price ? 1 : -1));
   var convertedData = [];
   for(let exc in exchangesType){
    var bitfinexDataBids = data.filter((o)=>o.type==="bid").sort((a, b) => (a.price > b.price ? 1 : -1)).reverse();//.filter((o)=>o.type==="bid");
    var bitfinexDataAsks = data.filter((o)=>o.type==="ask").sort((a, b) => (a.price > b.price ? 1 : -1));//.filter((o)=>o.type==="bid");
    const totalValuesBids = bitfinexDataBids.map( i => i.total);
    const totalValuesAsks = bitfinexDataAsks.map( i => i.total);

    //  console.log("Total Ask Value",totalValuesAsks);

       convertedData = [...bitfinexDataBids, ...bitfinexDataAsks].map((v,i) => {

      const totalValues = v.type === "bid"  ? totalValuesBids : totalValuesAsks
      const totalCumulative = i === 0 ? v.total : totalValues.slice(0, i).reduce( (p, c) => {return p+c})


      //console.log(i , v.type, v.total, totalCumulative)
      return {
        ...v, 
        totalCumulative
      }
      })
   }

   //const svg = d3.select('svg');

   const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  //  const width = target.node().clientWidth - margin.left - margin.right;
  //  const height = target.node().clientHeight - margin.top - margin.bottom;


   const x = d3.scaleLinear().range([0, width]);
   const y = d3.scaleLinear().range([height, 0]);
   const y1 = d3.scaleLinear().range([height, 0]);
 
  

      const svg = d3
        .select('#' + id)
        .append('svg')
         .attr('width', width+ margin.left + margin.right)
        .attr('height', height+ margin.top + margin.bottom)
       .style('margin', 50);
  
      // svg
      //   .selectAll('rect')
      //   .data(data)
      //   .enter()
      //   .append('rect')
      //   .attr('x', (d, i) => i * 70)
      //   .attr('y', (d, i) => height - 10 * d)
      //   .attr('width', 65)
      //   .attr('height', (d, i) => d * 10)
      //   .attr('fill', 'green');

      const g = svg.append('g')
      .attr("transform", "translate(" + margin.left + ","+ margin.top + ")");
      //.attr('transform', `translate(${margin.left+50},0)`);



      x.domain([
        d3.min(convertedData, d => d.price),
        d3.max(convertedData, d => d.price) + 1,
      ]);
      
      y.domain([0, d3.max(convertedData, d => d.totalCumulative)]);
      
      g.append('g')
          .attr('class', 'axis axis--y')
          .call(d3.axisLeft(y));


        // Add the Y1 Axis
  svg.append("g")
  .attr("class", "axisRed")
  .attr("transform", "translate( " + parseInt(width+30) +", 20 )")
  .call(d3.axisRight(y));

      g.append('g')
          .attr('class', 'axis axis--x')
          .attr('transform', `translate(0,${height})`)
          .call(d3.axisBottom(x));
      
      
      
         
    var div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);


    for(let exc of exchangesType){
      


     // console.log(data);

const bidData = convertedData.filter(o=>o.type==="bid" && o.category === exc );//BID
var askData = convertedData.filter(o=>o.type==="ask" && o.category === exc );//ASK

 var totalBidVolume = bidData.reduce((a,c)=>a+c.total,0);
// console.log("total Volune",totalBidVolume);

//  bidData.forEach((bValue,bidx)=>{
//   bValue.totalCumulativeBid =  bidx===0 ?  totalBidVolume : totalBidVolume - bValue.total;
//  });


askData.forEach((d,idx)=>{
 d.totalCumulative =  idx===0 ?  d.total : askData[idx-1].totalCumulative + d.total;
});

//console.log("bidata",bidData);
//console.log("askData",askData);


var bidCh =   g.append("path")
    .datum(bidData)
    .attr("fill", colorCodeObj[exc]["bid"])
     .attr("class",(d)=>`${exc}_bid all_bid`)
    .attr("fill-opacity", .3)
    .attr("stroke", "none")
    .attr("d", d3.area()
      .x(function(d) { return x(d.price) })
      .y0( height )
      .y1(function(d) { return y(d.totalCumulative) })
      )

// Add the line
g.append("path")
    .datum(bidData)
    .attr("fill", "none")
    .attr("stroke", colorCodeObj[exc]["bid"])
    .attr("class",(d)=>`${exc}_bid all_bid`)
    .attr("stroke-width", 1)
    .attr("d", d3.line()
    .x(function(d) { return x(d.price) })
    .y(function(d) { return y(d.totalCumulative) })
    )
    .on("mouseover", function(d) {
      console.log(d,this,d3.event);
    })

    // Add the scatterplot
    // g.selectAll("dot")	
    // .data(bidData)			
    // .enter().append("circle")		
    // .attr("class",(d)=>`${exc}_bid all_bid`)						
    // .attr("r", 5)		
    // .attr("display","none")
    // .attr("cx", function(d) { return x(d.price); })		 
    // .attr("cy", function(d) { return y(d.totalCumulative); })		
    // .on("mouseover", function(d) {		
    // console.log(d)
    // div.transition()		
    //     .duration(200)		
    //     .style("opacity", .9);		
    // div	.html("Price: "+d.price + "<br/>"  +"Volume: "+ d.totalCumulative)	
    //     .style("left", (d3.event.pageX) + "px")		
    //     .style("top", (d3.event.pageY - 28) + "px");	
    // })					
    // .on("mouseout", function(d) {
    //  console.log(this);	
    // div.transition()		
    //     .duration(500)		
    //     .style("opacity", 0);	
    // });

        //close 


      //adding the point on line
    //   svg.selectAll("myCircles")
    // .data(bidData)
    // .enter()
    // .append("circle")
    //   .attr("fill", "green")
    //   .attr("stroke", "none")
    //   .attr("cx", function(d) { return x(d.date) })
    //   .attr("cy", function(d) { return y(d.value) })
    //   .attr("r", 3)



      g.append("path")
    .datum(askData)
    .attr("fill", colorCodeObj[exc]["ask"])
    .attr("class",(d)=>`${exc}_ask all_ask`)
    .attr("fill-opacity", .3)
    .attr("stroke", "none")
    .attr("d", d3.area()
      .x(function(d) { return x(d.price) })
      .y0( height )
      .y1(function(d) { return y(d.totalCumulative) })
      )


   var mline =   g.append("path")
    .datum(askData)
    .attr("fill", "none")
    .attr("stroke", colorCodeObj[exc]["ask"])
    .attr("class",(d)=>`${exc}_ask all_ask`)
    .attr("stroke-width", 1)
    .attr("d", d3.line()
      .x(function(d) { return x(d.price) })
      .y(function(d) { return y(d.totalCumulative) })
      )
      // .on("mouseover", function(d) {	

      //   console.log(d);
      // 	})


      // Data dots
      // mline.selectAll("line-circle")
    	// 	.data(askData)
    	// .enter().append("circle")
      //   .attr("class", "data-circle")
      //   .attr("color","red")
      //   .attr("r", 5)
      //   .attr("cx", function(d) { return x(d.price); })
      //   .attr("cy", function(d) { return y(d.totalCumulative); });

    }

  //  console.log(height);
    var legend = svg.append("g")
.attr("class", "legend")
.attr("id","ad")
.attr('transform', `translate(640,${0})`);

var rects = legend.selectAll('#ad')
.data(text)
.enter()
.append("rect")
.attr("x", function(d, i){ return i *  100;})
.attr("y", 50)
.attr("width", 10)
.attr("height", 10)
.style("fill",function(d,i){return color[i];});

var texts = legend.selectAll('text')
.data(text)
.enter()
.append("text")
.attr("x", function(d, i){ return i *  100 + 15;})
.attr("y",60)
.attr("class","leg_txt_font")
.text(function(d,i){ return text[i];})

texts.on("click", function(d){
console.log( console.log( d3.selectAll(".BID")));
})

.on('mouseover', function(elemData){
  //alert(d)
  console.log(elemData);
  d3.selectAll(".all_ask").style("opacity", 0.01)
  d3.selectAll(".all_bid").style("opacity", 0.01)

  //d3.selectAll(".all_line").style("opacity", 0.01)
  
  d3.selectAll("."+elemData+"_ask").style("opacity", 3)
  d3.selectAll("."+elemData+"_bid").style("opacity", 3)

  //d3.selectAll("."+elemData+"_BID_line").style("opacity", 3)
})
    
.on('mouseout', function(d){
 // alert(d)

 d3.selectAll(".all_ask").style("opacity", 3)
  d3.selectAll(".all_bid").style("opacity",3)
});



}



      
    
    
    
      }, []);
  
    return <div id={id} />;
  }
  export default  D3Component;