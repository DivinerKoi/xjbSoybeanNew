import axios from 'axios';
import { getServiceBaseURL } from '@/utils/service';

// axios.defaults.baseURL = 'https://captcha.anji-plus.com/captcha-api';
// axios.defaults.baseURL = 'http://192.168.1.13:28888';
const isHttpProxy = import.meta.env.DEV && import.meta.env.VITE_HTTP_PROXY === 'Y';
const { baseURL } = getServiceBaseURL(import.meta.env, isHttpProxy);
axios.defaults.baseURL = baseURL;

const service = axios.create({
  timeout: 40000,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json; charset=UTF-8'
  }
});
service.interceptors.request.use(
  config => {
    return config;
  },
  error => {
    Promise.reject(error);
  }
);

// response interceptor
service.interceptors.response.use(
  response => {
    const res = response.data;
    return res;
  },
  error => {}
);
export default service;
