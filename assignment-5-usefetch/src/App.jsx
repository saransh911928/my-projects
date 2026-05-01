import React from "react";
import useFetch from "./useFetch";
import "./App.css";

  const App = () =>{
    const {data, loading, error } = useFetch("https://api.escuelajs.co/api/v1/products");

    if(loading)
      return (
         <div className="loader-container">
           <div className="spinner"></div>
           <p>Fetching data...</p>
          </div>
    );

    if(error) return <h2 className= "error">Error: {error}</h2>;
      
    return (
       <div>
        <h1>Photos</h1>
        <div className="container">
        {data &&
          data.slice(0, 12).map((item) => (
            <div className="card" key={item.id}>
              <img src={item.images?.[0]} alt={item.title} />
              <p>{item.title}</p>
            </div>
          ))}
        </div>
       </div>
    );
  };

export default App;
