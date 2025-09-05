<script setup>
import { ref, onMounted,onUnmounted,nextTick} from 'vue';
import { useRouter } from 'vue-router';
import { CommonService } from '@/api/api.js';
import  DelDialog from '@/components/DelDialog.vue'


const router = useRouter();

let logs = ref([]);
let vuid = ref('');
let token = ref('');
let projectId = ref('');
let selectId = ref('');
const isLoading = ref(false);   // 是否加载中
const hasMore = ref(true);      // 是否有更多数据
const videoList = ref([]);       // 列表数据
const pageNum = ref(1);         
const pageSize = ref(12);     
const videoItems = ref([]);    
const observer = ref(null); 
const scrollContainer = ref(null);

// 弹框显示状态
const showModal = ref(false);

onMounted(() => {
  const data = history.state;
  history.replaceState(null, '', location.pathname);

  if (data) {
    vuid.value = data.vuid;
    token.value = data.token;
    projectId.value = data.projectId;
    getHistory();

    const container = scrollContainer.value;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
  }
});

onUnmounted(() => {
  const container = scrollContainer.value;
  if (container) {
    container.removeEventListener('scroll', handleScroll);
  }
  // 销毁观察器
  if (observer.value) {
    observer.value.disconnect();
  }
});

function getHistory() {
  console.log('hasMore.value', hasMore.value)
  // 防止重复加载或无更多数据时请求
  if (isLoading.value || !hasMore.value) return;

  CommonService.history({
    vuid: vuid.value,
    token: token.value,
    projectId: projectId.value,
    pageNum: pageNum.value,
    pageSize: pageSize.value
  }).then(res => {
    if (res.code === '000000') {
      const list = res.result.data;
      if(list && list.length > 0){
        // 格式化新数据，添加加载状态标记
        const newVideos = list.map(item => ({
          ...item,
          isLoaded: false,    // 视频是否加载
          errorMsg: ''        // 错误信息
        }));
        
        videoList.value = [...videoList.value, ...newVideos];
        // 判断是否还有更多数据
        hasMore.value = videoList.value.length < res.result.totalNum;
        // 页码递增
        pageNum.value++;
        nextTick(() => {
          initIntersectionObserver();
        });
      }else{
        hasMore.value = false;
      }
      // logs.value = res.result.data;
    }
  });
}

// 初始化交叉观察器（用于懒加载）
const initIntersectionObserver = () => {
  // 先销毁已存在的观察器
  if (observer.value) {
    observer.value.disconnect();
  }
  
  // 创建新的交叉观察器
  observer.value = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // 元素进入视口且未加载视频时，触发加载
      if (entry.isIntersecting) {
        const index = entry.target.dataset.index;
        if (index !== undefined && !videoList.value[index].isLoaded) {
          loadVideo(Number(index));
        }
      }
    });
  }, {
    rootMargin: '200px 0px',  // 提前200px开始加载
    threshold: 0.1
  });

  // 加载指定索引的视频
  const loadVideo = (index) => {
    // 标记视频为已加载，触发视频播放器渲染
    videoList.value[index].isLoaded = true;
  };
  
  // 监听所有视频项
  videoItems.value.forEach((el, index) => {
    if (el) {
      el.dataset.index = index;
      observer.value.observe(el);
    }
  });
};

const handleConfirm = (data) => {
  console.log('点击了确认',data)
  showModal.value = false;
  CommonService.del({
    vuid: vuid.value,
    token: token.value,
    id: data.selectId,
    projectId: projectId.value
  }).then(res => {
    if (res.code === '000000') {
      getHistory();
    }
  });
}

function handleCancel() {
  console.log('点击了 取消')
  showModal.value = false;
}

function del(id) {
  showModal.value = true;
  selectId.value = id;
}

const closeLog = () => {
  router.back();
};

// 监听滚动事件，实现滚动加载更多
const handleScroll = () => {
  console.log('999', isLoading.value)

  // 避免频繁触发
  if (isLoading.value) return;
  
  // 计算滚动到底部的距离（50px内）
  const container = scrollContainer.value;
  const scrollTop = container.scrollTop;
  const scrollHeight = container.scrollHeight;
  const clientHeight = container.clientHeight;
  
  console.log('88888', scrollTop + clientHeight >= scrollHeight - 50)
  if (scrollTop + clientHeight >= scrollHeight - 50) {
    getHistory();
  }
};

</script>

<template>
    <div class="index-container">
    <div class="logs open" ref="scrollContainer">
      <div class="title">
        <div @click="closeLog">
          <img src="../assets/btn_back.png" alt=""></div>
          <div>创作记录</div>
        </div>
        <div class="log-list">
          <div class="list-con">
            <div  ref="videoItems" class="p-item" v-for="item in videoList" :key="item.id">
              <div class="cover">
                  <video :src="item.resultUrl" :poster="item.coverImg" controls></video>
              </div>
              <div class="btn">
                  <div @click="del(item.id)">删除</div>
              </div>
              <DelDialog 
                v-model:visible="showModal"
                title="删除提示"
                :selectId="selectId"
                @confirm="handleConfirm"
                @cancel="handleCancel"
              >
                <!-- 插槽内容 - 自定义弹框内容 -->
                <view>
                  <text >删除后将无法恢复，是否确认删除？</text>
                </view>
              </DelDialog>
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
</style>@/components/DelDialog.vue
