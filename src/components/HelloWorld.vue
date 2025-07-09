<script setup>
import { ref, onMounted, nextTick } from 'vue'
import {CommonService} from "@/api/api.js";
let musicList = ref([])
let avatorList = ref([])
let previewList = ref([])
let currentPreviewImg = ref('')
let currentSel = ref({
  musicId: '',
  avatarId: '',
})

onMounted(() => {
  getMaterial()
  getPreviewList()
})
function getMaterial() {
  CommonService.getMaterial().then(res => {
    console.log('资源',res);
    if(res.code === '000000') {
      avatorList.value = res.result.avatorList
      musicList.value = res.result.musicList
      currentSel.value.musicId = musicList.value[0].id
      currentPreviewImg.value = avatorList.value[0].url
      currentSel.value.avatarId = avatorList.value[0].id
    }
  })
}
function getPreviewList() {
  CommonService.previewList().then(res => {
    console.log('广场',res);
    if(res.code === '000000') {
      previewList.value = res.result
    }
  })
}

const clickM = (mid) => {
  currentSel.value.musicId = mid
}
const clickA = (data) => {
  currentSel.value.avatarId = data.id
  currentPreviewImg.value = data.url
}
const choosePreview = (data) => {
  currentSel.value.avatarId = data.avatarId
  currentSel.value.musicId = data.musicId
  currentPreviewImg.value = data.avatarUrl
  nextTick(() => {
    const currentImgElement = document.querySelector('.current-img')
    if (currentImgElement) {
      currentImgElement.scrollIntoView({ behavior: 'smooth' })
    }
  })
}

let createLoading = ref(false)
let backVideo = ref(false)
let videoUrl = ref('')
function createAudio() {
  console.log(currentSel.value);
  createLoading.value = true
  CommonService.createAudio({
    ...currentSel.value,
    uid: '1123123',
    secrete: '1231',
  }).then(res => {
    console.log(res);
    setTimeout(() => {
      if(res.code === '000000'){
        videoUrl.value = res.result
        setTimeout(() => {
          backVideo.value = true
        })
      }
    }, 2500)

  })
}
const backCreate= () => {
  createLoading.value = false
  backVideo.value = false
}
</script>

<template>
  <div>
    <div class="content" v-if="!createLoading">
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
              <span>{{item.displayMusicName}}</span>
            </div>
            <div class="btn">
              <div @click="choosePreview(item)">我也要玩</div>
            </div>
          </div>
        </div>
        <div class="bottom-bg">
          <img src="../assets/bottom-bg.png" alt="">
        </div>
      </div>
    </div>
    <div class="created" v-if="createLoading">
      <div class="loading" v-if="!backVideo">
        <img src="../assets/loading.png" alt="">
        <p>正在生成中，请耐心等待</p>
      </div>
      <div class="video-con" v-if="backVideo">
        <video :src="videoUrl" controls playsinline ></video>
        <div class="create-btn" @click="backCreate">
          <div>重新创作</div>
        </div>
      </div>

    </div>
  </div>

</template>

<style scoped lang="less">
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
  background: #3C78FF url("../assets/bg.png") no-repeat 0 0;
  background-size: contain;
  overflow-x: hidden;
  padding: 240px 16px;
  position: relative;
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
    border-radius: 8px;
    border: 2px solid #fff;
    overflow: hidden;
    margin-bottom: 16px;
    img{
      width: 100%;
      height: auto;
      border-radius: 8px;
      vertical-align: middle;
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
        >img{
          width: 100%;
          height: fit-content(50%);
          vertical-align: middle;
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

  .preview-list{
    margin-top: 16px;
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
          img{
            width: 100%;
            height: auto;
            border-radius: 8px;
          }
          >span{
            font-size: 16px;
            color: #fff;
            position: absolute;
            bottom: 8px;
            left: 16px;
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
      height: fit-content;
    }
  }
  .create-btn{
    position: absolute;
    z-index: 3;
    bottom: 64px;
    left: 50%;
    transform: translateX(-50%);
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
