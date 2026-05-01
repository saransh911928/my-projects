import {useState, useEffect, useCallback} from 'react';

const useFetch = (url) => {

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
     try{
        setLoading(true);
        setError(null);

        const response = await fetch(url);
        if (!response.ok){
          throw new Error('HTTP error! Status: ${response.status}');
        }
        
        const result = await response.json();
        setData(result);
    } catch (err){
        setError(err.message || "Something went wrong while fetching data")

    } finally{
        setLoading(false);
    }
}, [url]);  

useEffect(() => {
  fetchData();
},[fetchData]);

return { data, loading, error};
        
};

export default useFetch;