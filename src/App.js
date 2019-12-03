import React  from 'react';
import D3Component from './D3Component';
import DepthChart from "./D3_demo";
import jsonData from "./data.json";
//import Test6 from "./test6";

console.log(jsonData);

function App() {
  //const d3Container = useRef(null);
  return (
    <div className="App">

<DepthChart/>
         <D3Component  id="depthChart" jsonData={jsonData} />
        
         {/* <Test6 /> */}
    </div>
  );
}

export default App;
