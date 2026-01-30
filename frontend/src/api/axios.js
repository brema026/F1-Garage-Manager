import axios from 'axios';

const api = axios.create({
  baseURL: `http://${window.location.hostname}:3001/api`,
  withCredentials: true
});

export default api;
