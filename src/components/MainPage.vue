<script setup>
import {nextTick, onMounted, ref} from 'vue'
import {CommonService} from "@/api/api.js";
import { useRouter } from 'vue-router'
import msgDialog from '@/components/msgDialog.vue'
import axios from 'axios';

const router = useRouter()

let musicList = ref([])
let avatorList = ref([])
let previewList = ref([])
let currentPreviewImg = ref('')
let currentSel = ref({
  musicId: '',
  avatarId: '',
})
let token = ref('')
let pid = ref('')
let uid = ref('')
let url = 'https://migu-aimusic.yangshipin.cn/?btoken=e84c5a82da156094905673e4a95d153d&vuid=8918612acaf0e889bd7253c827f1ca79&projectId=AI_YS_WSGW&releaseId=81546853&cfrom=AI_YS_WSGW'
let showFlag = ref(false)
let resultUrl = ref('')
let  taskId = ref('')

onMounted(() => {
  token.value = getUrlParam('btoken')
  uid.value = getUrlParam('vuid')
  pid.value = getUrlParam('projectId')
  localStorage.setItem('token', token.value)
  localStorage.setItem('vuid', uid.value)
  
  if(!localStorage.getItem('url')&&!!currentSel.value.avatarId){
    localStorage.setItem('url',`https://sapi.yangshipin.cn/api/x/cctv/migu-music/material/`+`${currentSel.value.avatarId}-pic.jpg`)
  }
  if (localStorage.getItem('redirectToMakeSound') === 'true') {
    localStorage.removeItem('redirectToMakeSound');
    if(window.location.href.includes('mainPage')){
      // window.location.href.replace('mainPage','makeSound')
      taskId.value = window.location.href.match(/taskId=(\w+)/)?.[1];
      localStorage.setItem('taskId', taskId.value);
      currentSel.value.avatarId = localStorage.getItem('avatarId')?localStorage.getItem('avatarId'):'1'
      currentSel.value.musicId = localStorage.getItem('musicId')?localStorage.getItem('musicId'):'1'
      localStorage.setItem('avatarId',currentSel.value.avatarId);
      localStorage.setItem('musicId',currentSel.value.musicId );
      localStorage.setItem('url',`https://sapi.yangshipin.cn/api/x/cctv/migu-music/material/`+`${currentSel.value.avatarId}-pic.jpg`)
      goRuter()
    }
  }else{
    checkLogin()
  }
  // window.location.href = 'http://10.16.7.103:8082/?btoken=9968dc3387845808ff0e9e0b556fbfe6&vuid=a20303f0098a1a3c14fc02fd432fd430&projectId=AI_YS_WSGW&releaseId=81546853&cfrom=AI_YS_WSGW'
})
function checkLogin() {

  CommonService.checkLogin({
    "vuid":uid.value,
    "token":token.value,
    "projectId":pid.value
  }).then(res => {
    console.log(123,res);
    if(res.code == '000000') {
      getMaterial()
      getPreviewList()
      
    } else {
      window.location.href = 'https://y.migu.cn/app/v5/p/ai-charging/index.html?appId=e88c86edee570fdc525f1dfb3ed95823&schannel=014X031&projectId=AI_YS_WSGW&releaseId=81546853'
    }

  }).catch(err => {
    console.log(err);
  })
}

// 打开日志页面
const openLog = () => {
  const data = {
    vuid: uid.value,
    token: token.value,
    projectId: pid.value
  };
  router.push({
    path: '/logs',
    state: data
  });
}

function getMaterial() {
  CommonService.getMaterial().then(res => {
    console.log('资源',res);
    if(res.code === '000000') {
      avatorList.value = res.result.avatorList
      musicList.value = res.result.musicList
      currentSel.value.musicId = musicList.value[0].id
      currentPreviewImg.value = avatorList.value[0].url
      currentSel.value.avatarId = avatorList.value[0].id
      localStorage.setItem('url', currentPreviewImg.value);
      localStorage.setItem('avatarId', '1');
      localStorage.setItem('musicId', '1');
    }
  })
}
function getPreviewList() {
  CommonService.previewList().then(res => {
    console.log('广场',res);
    if(res.code === '000000') {
      previewList.value = res.result
      localStorage.setItem('avatarId', '1');
      localStorage.setItem('musicId', '1');
    }
  })
}

const clickM = (mid) => {
  currentSel.value.musicId = mid
  localStorage.setItem('musicId', mid);
}
const clickA = (data) => {
  currentSel.value.avatarId = data.id
  currentPreviewImg.value = data.url
  localStorage.setItem('url', currentPreviewImg.value);
  localStorage.setItem('avatarId', data.id);
}
const choosePreview = (data) => {
  currentSel.value.avatarId = data.avatarId
  currentSel.value.musicId = data.musicId
  currentPreviewImg.value = data.avatarUrl
  localStorage.setItem('url', currentPreviewImg.value);
  nextTick(() => {
    const currentImgElement = document.querySelector('.current-img')
    if (currentImgElement) {
      currentImgElement.scrollIntoView({ behavior: 'smooth' })
    }
  })
}

function createAudio() {
  taskId.value = window.location.href.match(/taskId=(\w+)/)?.[1];
  console.log('taskId.value', taskId.value)
  if((!taskId.value&&!window.location.href.split('?')[1])||(!!window.location.href.split('?')[1]&&!taskId.value)){
    if(!!window.location.href.split('?')[1]){
      localStorage.setItem('redirectToMakeSound', 'true');
      const url = `https://migu-aimusic.yangshipin.cn/?btoken=${token.value}`+`&vuid=${uid.value}`+'&projectId=AI_YS_WSGW&releaseId=81546853&cfrom=AI_YS_WSGW'
      const paramsUrl = encodeURIComponent(url)
      const resultUrl = 'https://y.migu.cn/app/v5/p/ai-charging/index.html?' + `appId=e88c86edee570fdc525f1dfb3ed95823&schannel=014X031&cburl=${paramsUrl}`+ `&pm=hash&templateId=*&projectId=AI_YS_WSGW#/task-id`
      window.location.href = resultUrl
      taskId.value = window.location.href.match(/taskId=(\w+)/)?.[1];
      localStorage.setItem('taskId', taskId.value);
    }
  }else{
    taskId.value = window.location.href.match(/taskId=(\w+)/)?.[1];
    localStorage.setItem('taskId', taskId.value);
    goRuter()
  }
}
function goRuter() {
  const data = {
    ...avatorList.value,
    ...currentSel.value,
    vuid: uid.value,
    token: token.value,
    projectId: pid.value,
  };
  router.push({
    path: '/makeSound',
    state: data,
    query: {
      // url: currentPreviewImg.value,
      // avatarId:data.avatarId,
      // musicId:data.musicId,
      // projectId:data.projectId,
      // token:data.token,
      // vuid:getUrlParam('vuid')?getUrlParam('vuid'):data.vuid,
    }
  });
}

function getUrlParam(name) {
  // 获取?后的查询字符串
  const queryString = window.location.search.substring(1);
  const params = {};

  if (queryString) {
    // 分割参数键值对
    queryString.split('&').forEach(pair => {
      const [key, value] = pair.split('=');
      if (key) {
        // 解码URI组件并存储
        params[key] = decodeURIComponent(value || '');
      }
    });
  }

  // 如果传了name则返回指定参数，否则返回全部参数对象
  return name ? params[name] || null : params;
}
function playVideo(url) {
  router.push({ path: '/video', query: { url: url } });
}
// 点击应用提示
function getReasons() {
  showFlag.value = true
}
const handleConfirm = () => {
  console.log('点击了确认')
  showFlag.value = false;
}
</script>

<template>
  <div class="index-container">
    <div class="content">
      <div class="log_msg" @click="getReasons">
        <img src="../assets/fail.png" alt="">
        应用说明
      </div>
      <msgDialog
        v-model:visible="showFlag"
        title="应用提示"
        position="center"
        confirmText="我知道了"
        @confirm="handleConfirm"
      >
        <!-- 插槽内容 - 自定义弹框内容 -->
        <view>
          <p class="reasons_tit">应用说明</p>
          <text >1、本服务由咪咕音乐提供，需要登录咪咕音乐账号后方可使用。<br>
2、应用在标注“活动体验”期间无需支付使用费用，一般情况下，每位用户有3次体验次数。体验期结束后，服务将根据 AI 技术研发投入及算力成本进行收费。<br>
3、用户可下载咪咕音乐APP，或至咪咕彩媒微信小程序体验更多功能与模板。<br>
4、使用中如有疑问，可以到咪咕音乐APP-我的-左上角三横线-帮助与客服，输入“人工”联系客服咨询，客服服务时间08:30-22:00，节假日无休。</text>
        </view>
      </msgDialog>
      <div class="log-btn" @click="openLog">创作记录</div>
      <div class="choose">
        <div class="tit-img"><img src="../assets/tit-1.png" alt=""></div>
        <div class="current-img">
          <img :src="currentPreviewImg" alt="">
        </div>
        <div class="m-list">
          <div class="m-item" v-for="item in musicList" :key="item.id" :class="currentSel.musicId === item.id ? 'current' : ''" @click="clickM(item.id)">
            <span>{{item.displayMusicName}}</span>
          </div>
        </div>
        <div class="a-list">
          <div class="a-item" v-for="item in avatorList" :key="item.id"  :class="currentSel.avatarId === item.id ? 'current' : ''" @click="clickA(item)">
            <div>
              <img :src="item.url" alt="">
            </div>
          </div>
        </div>
      </div>
      <div class="create-btn" @click="createAudio">
        <div>立即创作</div>
      </div>
      <div class="preview-list">
        <div class="tit-img"><img src="../assets/tit-2.png" alt="" style="width: 60%"></div>
        <div class="list-con">
          <div class="p-item" v-for="item in previewList" :key="item.id">
            <div class="cover">
              <img :src="item.avatarUrl" alt="">
              <span>{{item.productName}}</span>
              <img @click="playVideo(item.resultUrl)" class="play" src="../assets/play.png" alt="">
            </div>
            <div class="btn">
              <div @click="choosePreview(item)">我也要玩</div>
            </div>
          </div>
        </div>
      </div>
      <div class="bottom-bg">
        <img src="../assets/bottom-bg.png" alt="">
      </div>
    </div>
  </div>

</template>

<style scoped lang="less">
.reasons_tit{
  text-align: center;
  font-size: 18px;
  font-weight: 600;

}
.play-video-modal{
  width: 100vw;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  background: #000;
  .close{
    color: white;
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 999;
    >img{
      width: 36px;
    }
  }
  video{
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 0;
    width: 100%;
    height: auto;
    z-index: 998;
  }
}
.index-container{
  width: 100vw;
  overflow-x: hidden;
}
.create-btn{
  >div{
    height: 50px;
    line-height: 50px;
    width: 284px;
    text-align: center;
    margin: auto;
    background: url("../assets/btn-bg.png") no-repeat 0 0;
    background-size: 100% 100%;
    font-size: 18px;
    color: #fff;
  }
}
.content{
  width: 100vw;
  background: #3C78FF url("../assets/bg.png") no-repeat 0 -5vh;
  background-size: contain;
  overflow-x: hidden;
  padding: 16.5vh 5vw;
  position: relative;
  padding-bottom: 10vh;
  .log_msg{
    width: 100px;
    height: 30px;
    line-height: 30px;
    background: #0d0c0c;
    text-align: right;
    border-radius: 30px;
    position: absolute;
    right: 100px;
    top: 24px;
    z-index: 2;
    color: #fff;
    opacity: 0.7;
    padding-right: 7px;
    img{
      width: 20px;
      height: 20px;
      display: block;
      margin: 5px 0 5px 8px;
      position: absolute;
    }
  }
  .log-btn{
    width: 120px;
    height: 30px;
    line-height: 30px;
    border-radius: 30px;
    background: linear-gradient(90deg, #5DF7FC 0%, #FFFFFF 98%);
    color: #0B2770;
    position: absolute;
    right: -24px;
    top: 24px;
    text-align: left;
    padding-left: 24px;
    z-index: 2;
  }
  .bottom-bg{
    position: absolute;
    width: 100%;
    bottom: 0;
    left: 0;
    >img{
      width: 100%;
      vertical-align: middle;
    }
  }
  .tit-img{
    width: 100%;
    margin-bottom: 16px;
    text-align: center;
    >img{
      width: 100%;
    }
  }
  .current-img{
    width: 100%;
    height: 424px;
    border-radius: 16px;
    border: 2px solid #fff;
    overflow: hidden;
    margin-bottom: 16px;
    position: relative;
    img{
      width: 100%;
      height: auto;
      border-radius: 8px;
      vertical-align: middle;
      position: absolute;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
    }
  }
  .choose{
  }
  .m-list,.a-list{
    margin-bottom: 16px;
    display: flex;
    width: 100%;
    overflow-x: auto;
    .m-item,.a-item{
      margin-right: 16px;
      &::-webkit-scrollbar{
        width: 0;
        display: none;
      }
      &:last-child{
        margin-right: 0;
      }
    }
    .m-item{
      box-sizing: content-box;
      height: 30px;
      line-height: 30px;
      text-align: center;
      border-radius: 30px;
      background: linear-gradient(0deg, #3B6ACC, #3B6ACC), linear-gradient(90deg, #284090 0%, #282075 100%);
      transition: all .2s;
      padding: 0 20px;
      width: auto;
      >span{
        color: #fff;
        font-weight: bold;
        font-size: 16px;
        white-space: nowrap;
      }
      &.current{
        background: linear-gradient(90deg, #5DF7FC 0%, #FFFFFF 98%);
        >span{
          color: #0B2770;
        }
      }
    }
    .a-item{
      >div{
        transition: all .2s;
        width: 100px;
        height: 100px;
        border-radius: 8px;
        border: 4px solid transparent;
        overflow: hidden;
        position: relative;
        >img{
          width: 100%;
          height: auto;
          vertical-align: middle;
          position: absolute;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
        }
      }
      &.current{
        >div{
          border-color: #5FF0FC;
        }
      }
    ;
    }
  }

}

.preview-list,.log-list{
  margin-top: 16px;
  position: relative;
  z-index: 1;
  .list-con{
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    .p-item{
      margin-right: 16px;
      margin-bottom: 16px;
      width: calc(50% - 8px);
      &:nth-child(2n){
        margin-right: 0;
      }
      .cover{
        position: relative;
        margin-bottom: 8px;
        height: 220px;
        overflow: hidden;
        border-radius: 8px;
        img{
          width: 100%;
          height: auto;
          border-radius: 8px;
          position: absolute;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
        }
        >span{
          font-size: 16px;
          color: #fff;
          position: absolute;
          bottom: 8px;
          left: 16px;
        }
        .play{
          width: 35px;
          height: 40px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      }
      .btn{
        >div{
          width: 100%;
          height: 30px;
          line-height: 30px;
          text-align: center;
          border-radius: 30px;
          background: linear-gradient(90deg, #5DF7FC 0%, #FFFFFF 98%);
          color: #0B2770;
        }
      }
    }
  }
}
.logs{
  width: 0;
  height: 100vh;
  overflow-y: auto;
  padding: 0;
  position: absolute;
  top: 0;
  left: 100%;
  background: url("../assets/sub-bg.png") no-repeat 0 0;
  background-size: 100% 100%;
  z-index: 99;
  transition: left .2s;
  &.open{
    width: 100vw;
    padding: 16px;
    left: 0;
  }
  .title{
    display: flex;
    height: 40px;
    line-height: 40px;
    >div{
      font-size: 20px;
      font-weight: bold;
      color: #fff;
      &:first-child{
        width: 36px;
        text-align: center;
        font-size: 24px;
        >img{
          width: 100%;
        }
      }
      &:nth-child(2){
        width: calc(100% - 36px);
        text-align: center;
        text-indent: -36px;
      }
    }
  }
  .log-list{
    height: 100%;
    padding-bottom: 32px;
    .list-con{
      height: 100%;
      .p-item{
        .cover{
          height: auto;
          video{
            width: 100%;
            height: auto;
            border-radius: 8px;
            position: relative;
          }
          >span{
            font-size: 16px;
            color: #fff;
            position: absolute;
            bottom: 8px;
            left: 16px;
          }
        }
      }
    }
  }
}
.created{
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: url("../assets/sub-bg.png") no-repeat 0 0;
  background-size: 100% 100%;
  position: relative;
  .video-con{
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 2;
    top: 0;
    left: 0;
    >video{
      width: 100%;
      height: auto;
      position: absolute;
      top: 0;
      left: 0;
    }
    .log-btn{
      width: 120px;
      height: 30px;
      line-height: 30px;
      border-radius: 30px;
      background: linear-gradient(90deg, #5DF7FC 0%, #FFFFFF 98%);
      color: #0B2770;
      position: absolute;
      right: -24px;
      top: 24px;
      text-align: left;
      padding-left: 24px;
      z-index: 2;
    }
    .back-icon{
      position: absolute;
      top: 16px;
      left: 16px;
      font-weight: bold;
      color: #fff;
      width: 36px;
      text-align: center;
      font-size: 24px;
      z-index: 2;
      >img{
        width: 100%;
      }
    }
  }
  .bottom-btn{
    display: flex;
    flex-direction: column;
    position: absolute;
    z-index: 3;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
  }
  .create-btn{
    margin-bottom: 16px;
    &:first-child{
      background: transparent;

      border: 2px solid #fff;
      border-radius: 25px;
      color: #fff;
      >div{
        background-image: none;
      }
    }
  }
  .loading{
    font-size: 18px;
    color: #fff;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    >img{
      width: 84px;
      height: 84px;
      margin-bottom: 16px;
    }
  }
}
</style>
