<script setup>
import { ref, onMounted,watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { CommonService } from '@/api/api.js';
import { useAudioStore } from '@/store/modules/audioStore'; // 导入 Pinia 状态
import axios from 'axios'

const route = useRoute();
const router = useRouter();
const audioStore = useAudioStore();
let audioFormData = null;
let relatedParams = null;
let backVideo = ref(false);
let backVideFalse = ref(false);
let videoUrl = ref('');
let coverUrl = ref('');
let errorMsg = ref('');
let isRequesting = ref(false);
let progressTimer = null;         // 进度更新计时器

const imgUrl = ref(route.query.url);
// const file = ref(route.query.audio);
const avatarId = ref(route.query.avatarId);
const musicId = ref(route.query.musicId);
const projectId = ref(route.query.projectId);
const token = ref(route.query.token);
const vuid = ref(route.query.vuid);
const taskId = ref(route.query.taskId);
onMounted(() => {
  // const data = history.state;
  history.replaceState(null, '', location.pathname);

  // 1. 从 Pinia 获取 FormData 和关联参数
  audioFormData = audioStore.audioFormData;
  relatedParams = audioStore.audioRelatedParams;

  // 2. 验证数据（避免未存储就访问）
  if (!audioFormData) {
    console.error('未获取到音频 FormData，请先完成录音并存储状态');
    // 可选：跳回上一页
    // router.back();
    return;
  }
  console.log('relatedParams', relatedParams.token)
  uploadAudio(audioFormData, relatedParams.token);

  // if (musicId && avatarId&&file) {
  //   createAudio(musicId.value,avatarId.value, vuid.value, token.value, projectId.value,file.value);
  // } else {
  //   console.error('Create page loaded without necessary data.');
  // }
});
// 用 FormData 上传接口
const uploadAudio = async (formData, token) => {
//   const queryParams = {
//     fileName: 'file.webm',
//   };
//  const obj={
//     vuid:relatedParams.vuid,
//     pageSize:10,
//     pageNum:1,
//  } 
//   Object.entries(queryParams).forEach(([key, value]) => {
//     audioFormData.append(key, value); // 如添加 token、projectId 等
//   });
//   audioFormData.append('Qo', JSON.stringify(obj));
  try {
    const response = await fetch('/api/api/userMusic/create', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}` // 从关联参数获取 token
      },
      body: formData // 直接使用从 Pinia 获取的 FormData
    });

    if (response.ok) {
      const result = await response.json();
      // 000000  创建成功  40001, "您已加入队列，请稍后" 50002,"任务在生成中，请稍等" 10002, "生成完成"
      if(result.code == '000000'|| result.code == '10002'|| result.code == '40001'|| result.code == '50002'){
        progressTimer = setInterval(fetchResultList, 2000);
      }
    } else {
      throw new Error('上传失败');
    }
  } catch (err) {
    backVideo.value = false;
    backVideFalse.value = true;
    clearTimeout(progressTimer);
    console.error('上传错误：', err);
  }
};
const fetchResultList = async (data = {}) => {
  try {
    isRequesting = true;
    const response = await axios.post('/api/userMusic/getResult', {
      vuid:vuid.value,
      token:token.value,
    });
    console.log('response', response)
    if(response.data.result.status == '2'){
      backVideo.value = false;
      backVideFalse.value = false;
      videoUrl.value = response.data.result.resultUrl;
      backVideo.value = true;
      coverUrl.value = imgUrl.value;
      clearInterval(progressTimer);
    }
    return response.data;
  } catch (error) {
    clearTimeout(progressTimer);
    console.error('失败：', error.message);
    throw error; // 抛出错误供外部处理
  } finally {
    isRequesting = false; // 无论成败，重置请求状态
  }
};

const backCreate = () => {
  // router.back();
  router.push({ name: 'MainPage' });
};

function publicVideo() {
  window.location.href = `https://y.migu.cn/app/v5/p/publish-mid/index.html?projectId=AI_YS_WSGW&releaseId=81546853&videoUrl=${videoUrl.value}&videoCover=${coverUrl.value}`;
}

</script>

<template>
  <div class="index-container">
    <div class="created">
      <div class="loading" v-if="!backVideo&&!backVideFalse">
        <img src="../assets/loading.png" alt="">
        <p>正在生成中，请耐心等待</p>
      </div>
      <div class="failPage" v-if="!backVideo&&!!backVideFalse">
        <div class="loading">
          <img src="../assets/fail.png" alt="">
          <p>生成失败，请重新生成</p>
          <p style="font-size: 14px;margin-top:8px;">原因:{{ errorMsg }}</p>
        </div>
        <div class="bottom-btnAgain">
          <div class="create-btn" @click="backCreate" v-if="!backVideo&&!!backVideFalse">
            <div>重新创作</div>
          </div>
        </div>
      </div>
      <div class="video-con" v-if="backVideo">
        <div class="back-icon" @click="backCreate">
          <img src="../assets/btn_back.png" alt="">
        </div>
        <video :src="videoUrl" controls playsinline></video>
        <div class="bottom-btn">
          <!-- <div class="create-btn" @click="backCreate" v-if="!backVideo&&!!backVideFalse">
            <div>重新创作</div>
          </div> -->
          <div class="create-btn" @click="publicVideo">
            <div>发布视频</div>
          </div>
          <div class="ai_msg">
            <img src="../assets/ai_msg.png" alt="">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.ai_msg{
  margin-top: 10px;
}
.ai_msg img{
  width: 70px;
  height: 23px;
  margin-left: -41px;
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
    display: flex;
    justify-content: center;
    align-items: center;
    >video{
      width: 100%;
      height: auto;
      position: absolute;
      top: 0;
      left: 0;
    }
    // >img{
    //   width: 100%;
    //   height: auto;
    //   position: absolute;
    //   top: 0;
    //   left: 0;
    //   margin:0 auto
    // }
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
  .bottom-btnAgain{
    display: flex;
    // flex-direction: column;
    position: absolute;
    z-index: 3;
    bottom: 70px;
    left: 50%;
    transform: translateX(-50%);
  }
  .create-btn{
    // margin-bottom: 16px;
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
  .bottom-btn{
    display: flex;
    flex-direction: column;
    position: absolute;
    z-index: 3;
    bottom: 65px;
    left: 50%;
    transform: translateX(-50%);
  }
  .create-btn{
    // margin-bottom: 16px;
    // &:first-child{
    //   background: transparent;

    //   border: 2px solid #fff;
    //   border-radius: 25px;
    //   color: #fff;
    //   >div{
    //     background-image: none;
    //   }
    // }
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
  .failPage{
    display: flex;
    flex-direction: column;
    justify-content: center;
    
  }
}
</style>