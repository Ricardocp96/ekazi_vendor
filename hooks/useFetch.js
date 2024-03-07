import { useState, useEffect } from "react";
import axios from "axios";

const useFetch = (endpoint, query) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const options = {
    method: 'GET',
    url: 'http://13.51.201.202:3000/jobs',
    params: {
      query: 'description',
      page: '1',
      num_pages: '1'
    },
    headers: {
      'X-RapidAPI-Key': 'b10b0e5043msha5b765dbb03010ep119851jsn0d0232ae8f0f',
      'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
    }
  };
  
  const fetchData = async () => {
    setIsLoading(true);

    try {
      const response = await axios.request(options);

      setData(response.data);
      console.log(response.data)
      setIsLoading(false);
    } catch (error) {
      setError(error);
      console.log(error)
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refetch = () => {
    setIsLoading(true);
    fetchData();
  };

  return { data, isLoading, error, refetch };
};

export default useFetch;