import axios from 'axios';
import { getUrlDevLinkV3 } from './helpFunction';
let myInterceptor = axios
myInterceptor.interceptors.request.use(function (config) {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined' && localStorage) {
    const token = localStorage.getItem('jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers.language= localStorage.getItem('language') ?? 'en'
  }
  return config;
});

myInterceptor.interceptors.response.use(

  function (response) {
    return response;
  },
  function (error) {
    return Promise.reject(error);
  }
);
export async function axiosPOST(type = '', Url, param = {}, config = {}) {
  let URL_BASE_ADMIN = getUrlDevLinkV3(type);
  return myInterceptor
    .post(URL_BASE_ADMIN + Url, param, config)
    .then(res => res)
    .catch(err => Promise.reject(err?.response));
}


export async function axiosGET(type, Url) {
  let URL_BASE_ADMIN = getUrlDevLinkV3(type)
  return (myInterceptor.get(URL_BASE_ADMIN + Url)
  .then(res => {
    return res;
  }).catch(err => {
    return Promise.reject(err?.response);
  })
  );
}

export async function axiosPUT(type = '', Url, param = {}) {
  let URL_BASE_ADMIN = getUrlDevLinkV3(type)
  return myInterceptor.put(URL_BASE_ADMIN + Url, param).then(res => {
    return res;
  }).catch(err => {
    return Promise.reject(err?.response);
  })
}
export async function axiosDELETE(type = '', Url, param = {}) {
  let URL_BASE_ADMIN = getUrlDevLinkV3(type)
  return myInterceptor.delete(URL_BASE_ADMIN + Url, param).then(res => {
    return res;
  }).catch(err => {
    return Promise.reject(err?.response);
  })
}
export async function axiosPATCH(type = '', Url, param = {}) {
  let URL_BASE_ADMIN = getUrlDevLinkV3(type)
  return myInterceptor.patch(URL_BASE_ADMIN + Url, param).then(res => {
    return res;
  }).catch(err => {
    return Promise.reject(err?.response);
  })
}