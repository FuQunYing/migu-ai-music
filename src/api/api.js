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
export class CommonService{
    static async getMaterial() {
        return request('/userMusic/getMaterial', 'post')
    }
    static async createAudio(param) {
        return request('/userMusic/create', param,'post')
    }
    static async previewList() {
        return request('/userMusic/getResultList', 'post')
    }
    static async exportData(url,param, name) {
        return request(url, param,'get','blob').then((res) => {
            if (res) {
                const link = document.createElement('a')
                const blob = new Blob([res], {type: 'application/vnd.ms-excel'});
                link.style.display = 'none'
                link.href = URL.createObjectURL(blob);
                link.setAttribute('download', name + '.xlsx')
                console.log(link);
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
            } else {
                message.warning('暂无数据')
            }
        })
    }
}

