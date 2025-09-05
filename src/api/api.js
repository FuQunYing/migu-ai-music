import { request } from './axios.js';

// 登录退出
export class LoginService{
    // 登录
    static async login(param) {
        return request('/login', param, 'post')
    }
    static async sendCode(param) {
        return request('data/code/sendCode', param, 'post')
    }
    // 退出登录
    static async logout() {
        return request('data/user/exit', 'post')
    }
}
/*
https://migu-aimusic.yangshipin.cn/nofilter/login登陆接口
入参json
{
"vuid":121,
"token":"sdfdsf",
"projectId":"sdfsf"
}
成功返回
{
    "code": "000000",
    "msg": "",
    "result": ""
}
错误返回 code不为000000
{
    "code": "401",
    "msg": "",
    "result": null
}
* */

export class CommonService{
    static async checkLogin(param) {
        return request('/nofilter/login',param, 'post')
    }
    static async getMaterial() {
        return request('/userMusic/getMaterial', 'post')
    }
    static async createAudio(param) {
        return request('/userMusic/create', param,'post')
    }
    static async previewList() {
        return request('/userMusic/getResultList', 'post')
    }

    static async previewResult() {
        return request('/userMusic/getResult', 'post')
    }

    static async history(param) {
        return request('/userMusic/getUserHistory', param,'post')
    }
    static async del(param) {
        return request('/userMusic/del',param, 'post')
    }
    // 开始录音
    static async beginSound(param) {
        // return request('/userMusic/del',param, 'post')
    }
}

