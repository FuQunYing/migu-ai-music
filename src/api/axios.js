// @ts-ignore
import axios from "axios";
// import { message } from "ant-design-vue";

// 接口超时时间
axios.defaults.timeout = 600000;
// 请求地址
// @ts-ignore
axios.defaults.baseURL = import.meta.env.VITE_BASE_URL
let token = ''
// http request 拦截器
axios.interceptors.request.use(
    config => {
        if(config.url !== 'login') {
            token = localStorage.getItem('userId')
        }
        // @ts-ignore
        config.headers.Authorization = localStorage.getItem('userId')
        return config;
    },
    error => {
        // @ts-ignore
        return Promise.reject(error)
    }
)
// http response 拦截器
axios.interceptors.response.use(
    response => { return response },
    error => {
        const {response} = error;
        console.log(response);
        if(response) {
        //    请求已发出，但不在2xx的范围
            // @ts-ignore
            return Promise.reject(response);
        } else {
            // message.warning('网络连接异常，请稍后再试！')
        }
    }
)
// 封装GET POST 请求并导出
export function request(url='', params={}, type='POST', responseType='') {
    if(url !== '/login') {
        // params.userId = localStorage.getItem('userId')
    }
    // @ts-ignore
    return new Promise((resolve, reject) => {
        let promise
        if(type.toUpperCase() === 'GET') {
            // @ts-ignore
            promise = axios({url: '/api'+url, params, responseType: responseType})
        } else {
            // @ts-ignore
            promise = axios({
                method: type,
                url: '/api'+url,
                data:params
            })
        }
        //    处理返回
        // @ts-ignore
        promise.then(res => {
            console.log(res);
            if(res.status === 200) {
                resolve(res.data)
            } else {
                // message.error(res.data.msg)
            }
        }).catch(err => {
            reject(err)
        })
    })
}


