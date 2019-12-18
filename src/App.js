import React  from 'react';
import D3Component from './D3Component';
//import DepthChart from "./D3_demo";
import jsonData from "./data.json";
//import DepthChartExchanges from './depthChartExchanges';

import DepthChartExchangesNew from './depthChartExchangesNew';
import StepChart from './stepChart/stepChart';
//import MultiStackDepthChart from './multipalStack/multiStack';
//import Test6 from "./test6";

console.log(jsonData);

function App() {
  //const d3Container = useRef(null);
  return (
    <div className="App">
         <DepthChartExchangesNew />
    </div>
  );
}

export default App;
