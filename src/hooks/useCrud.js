import { useState, useCallback } from 'react';
import api from '../services/api';


const useApi = (baseURL) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // GET request
  const get = useCallback(async (endpoint) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`${baseURL}${endpoint}`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [baseURL]);

  // POST request
  // const post = useCallback(async (endpoint, data) => {
  //   try {
  //     setLoading(true);
  //     setError(null);
  //     const response = await api.post(`${baseURL}${endpoint}`, data);
  //     return response.data;
  //   } catch (err) {
  //     setError(err.response?.data?.message || err.message);
  //     throw err;
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [baseURL]);

  const post = useCallback(async (endpoint, data, options = {}) => {
    try {
      setLoading(true);
      setError(null);

      // Check if data is FormData
      const isFormData = data instanceof FormData;

      const config = {
        headers: {
          // Don't set Content-Type for FormData (browser will set it with boundary)
          ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
          ...options.headers
        },
        ...options
      };

      const response = await api.post(`${baseURL}${endpoint}`, data, config);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [baseURL]);

  // PUT request
  const put = useCallback(async (endpoint, data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.put(`${baseURL}${endpoint}`, data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [baseURL]);

  // DELETE request
  const del = useCallback(async (endpoint) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.delete(`${baseURL}${endpoint}`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [baseURL]);

  return {
    get,
    post,
    put,
    delete: del,
    loading,
    error
  };
};

export default useApi;