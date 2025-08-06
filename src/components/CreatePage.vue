<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { CommonService } from '@/api/api.js';

const route = useRoute();
const router = useRouter();

let backVideo = ref(false);
let videoUrl = ref('');
let coverUrl = ref('');

onMounted(() => {
  const data = history.state;

  history.replaceState(null, '', location.pathname);

  if (data && data.musicId && data.avatarId) {
    createAudio(data.musicId, data.avatarId, data.vuid, data.token, data.projectId);
  } else {
    console.error('Create page loaded without necessary data.');
  }
});

function createAudio(musicId, avatarId, vuid, token, projectId) {
  CommonService.createAudio({
    musicId,
    avatarId,
    vuid,
    token,
    projectId
  }).then(res => {
    console.log(res);
    setTimeout(() => {
      if (res.code === '000000') {
        videoUrl.value = res.result.resultUrl;
        coverUrl.value = res.result.avatarUrl;
        backVideo.value = true;
      }
    }, 2500);
  }).catch(err => {
    console.error('API call failed:', err);
  });
}

const backCreate = () => {
  router.back();
};

function publicVideo() {
  window.location.href = `https://y.migu.cn/app/v5/p/publish-mid/index.html?projectId=AI_YS_WSGW&releaseId=81546853&videoUrl=${videoUrl.value}&videoCover=${coverUrl.value}`;
}

</script>

<template>
  <div class="index-container">
    <div class="created">
      <div class="loading" v-if="!backVideo">
        <img src="../assets/loading.png" alt="">
        <p>正在生成中，请耐心等待</p>
      </div>
      <div class="video-con" v-if="backVideo">
        <div class="back-icon" @click="backCreate"><img src="../assets/btn_back.png" alt=""></div>
        <video :src="videoUrl" controls playsinline></video>
        <div class="bottom-btn">
          <div class="create-btn" @click="backCreate">
            <div>重新创作</div>
          </div>
          <div class="create-btn" @click="publicVideo">
            <div>发布视频</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
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
    bottom: 24px;
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