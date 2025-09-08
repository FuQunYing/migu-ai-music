<script setup>
import { ref, onMounted,computed,onUnmounted,watch } from 'vue';
import { useRoute,useRouter } from 'vue-router';
import { CommonService } from '@/api/api.js';
import CustomDialog from '@/components/CustomDialog.vue'
import SoundBegin from '@/components/soundBegin.vue'
import { useAudioStore } from '@/store/modules/audioStore'; // 导入 Pinia 状态
const router = useRouter();
const route = useRoute();
const avatarId = ref(route.query.avatarId);
const musicId = ref(route.query.musicId);
const projectId = ref(route.query.projectId);
const token = ref(route.query.token);
const vuid = ref(route.query.vuid);
const audioStore = useAudioStore(); // 获取 Pinia 实例

let logs = ref([]);
let isFlag = ref(false);
let audioUrl = ref('');// 音频地址  是返回 FormData 的 Promise

// let vuid = ref('');
// let token = ref('');
// let projectId = ref('');
let selectUrl = ref('');
let selectTaskId = ref('');
// 创建响应式变量
const isChecked = ref(false);
// 弹框显示状态
const showModal = ref(false);
// 弹框显示状态
const showFlag = ref(false);

// 开始
// 音频核心状态
const audioRef = ref(null);       // 原生 audio 实例
const isPlaying = ref(false);     // 是否正在播放
const audioLoaded = ref(false);   // 音频是否加载完成
const currentTime = ref(0);       // 当前播放时间（秒）
const duration = ref(0);          // 音频总时长（秒）
const playProgress = ref(0);      // 播放进度（百分比）
let progressTimer = null;         // 进度更新计时器

// 1. 切换播放/暂停
const togglePlay = () => {
  const audio = audioRef.value;
  if (!audio) return;

  if (isPlaying.value) {
    audio.pause();
  } else {
    // 播放时捕获可能的错误（如跨域、音频损坏）
    audio.play().catch(err => {
      console.error('音频播放失败：', err);
      alert('播放失败，请检查音频地址或浏览器权限');
    });
  }
  isPlaying.value = !isPlaying.value;
};

// 3. 播放结束后重置状态
const resetPlayState = () => {
  isPlaying.value = false;
  currentTime.value = 0;
  playProgress.value = 0;
  clearInterval(progressTimer);
};

// 4. 实时更新播放进度
const updateProgress = () => {
  const audio = audioRef.value;
  if (!audio || !isPlaying.value) return;

  currentTime.value = audio.currentTime;
  duration.value = audio.duration || 0;
  // 计算进度百分比（避免 NaN）
  playProgress.value = duration.value ? (currentTime.value / duration.value) * 100 : 0;
};

// 6. 监听播放状态，启动/停止进度计时器
watch(isPlaying, (newVal) => {
  if (newVal) {
    // 播放时每秒更新一次进度
    progressTimer = setInterval(updateProgress, 1000);
  } else {
    clearInterval(progressTimer);
  }
});

// 7. 组件卸载时清理资源（避免内存泄漏）
onUnmounted(() => {
  const audio = audioRef.value;
  if (audio) {
    audio.pause();
    audio.src = ''; // 释放音频资源
  }
  clearInterval(progressTimer);
});

// 结束



onMounted(() => {
  // const stateData = history.state;
  console.log('avatarId', avatarId)
  console.log('musicId', musicId)
  console.log('projectId', projectId)
  console.log('token', token)
  console.log('vuid', vuid)
  // console.log('taskId', taskId)
  history.replaceState(null, '', location.pathname);
  const imgUrl = localStorage.getItem('url');
  const taskId = localStorage.getItem('taskId');
  console.log('taskId', taskId)
  console.log('imgUrl', imgUrl)
  if (!!taskId&&!!imgUrl) {
    selectUrl = imgUrl;
    selectTaskId = taskId;
  }
  
});
// 开始录音
const beginSound = () => {
  // 检查是否选中
  if (isChecked.value) {
    console.log('录音开始',isChecked);
    showFlag.value = true;
  }else{
    // 未选中时显示弹框
    showModal.value = true;
    return;
  }
};
const handleConfirm = () => {
  console.log('点击了确认')
  isChecked.value = true;
}

// 计算属性：解析 Vite 中的本地图片路径
const bgUrl = computed(() => {
  if (!isFlag.value) {
    return bgUrl.value || getDefaultUrl(); // 保持当前路径
  }
  // isFlag为true时，正常解析新路径
  try {
    return new URL('/src/assets/sub-bg.png', import.meta.url).href;
  } catch (err) {
    console.error('图片加载失败：', err);
  }
});

// 辅助函数：获取默认图片路径
const getDefaultUrl = () => {
  return new URL('/src/assets/bg_black.png', import.meta.url).href;
};

// 录音完成
const handleEnd = (data) => {
  console.log('录音完成，即将跳转页面...')
  console.log('data', data)
  isFlag.value = true;
  audioUrl = data; // 录音的音频URL
}
  // 跳转路由的方法（关键：先解析 Promise）
  const goToCreatePage = async () => {
    try {
      const audioFormData = await audioUrl.value; 
      if (!(audioFormData instanceof FormData)) {
        throw new Error('解析后的数据不是 FormData 格式');
      }
      audioStore.setAudioFormData(audioFormData);
      audioStore.setAudioRelatedParams({
        url: selectUrl,
        avatarId: avatarId,
        musicId: musicId,
        projectId: projectId,
        token: token,
        vuid: vuid,
        taskId: selectTaskId
      });
      router.push({ 
        path: '/create', 
        query: { 
          url: selectUrl,
          avatarId: avatarId.value,
          musicId: musicId.value,
          projectId: projectId.value,
          token: token.value,
          vuid: vuid.value,
          taskId:selectTaskId,
        } 
      });

    } catch (err) {
      console.error('解析 FormData 或跳转失败：', err);
    }
  };
const createAudio = () => {
  console.log('audioUrl', audioUrl)
  // 调用跳转方法，确保音频数据正确传递到新页面
  goToCreatePage();
}

const backCreate = () => {
  router.push({ name: 'MainPage' });
};

const closeLog = () => {
  router.back();
};

</script>

<template>
    <div class="index-container">
    <div  class="logs open" :style="{ backgroundImage: `url(${bgUrl})` }">
        <div class="title">
          <div @click="closeLog" v-if="!isFlag">
            <img src="../assets/btn_back.png" alt="">
          </div>
          <div v-else></div>
          <div>录制声音</div>
        </div>
        <div v-if="!!isFlag" style="display: flex;justify-content: center;">
          <div class="audio-player">
            <div class="audio-cover">
              <img class="cover-img" :src="selectUrl" alt="音频封面">
              <div class="play-btn"  @click="togglePlay"
                :disabled="!audioLoaded" > 
                <img v-if="!isPlaying" src="../assets/play.png" alt="">
                <!-- <img v-else src="../assets/play.png" alt=""> -->
              </div>
            </div>
            <audio 
              ref="audioRef"
              :src="audioUrl" 
              controls 
              class="audio-player"
              @canplay="audioLoaded = true"  
              @ended="resetPlayState"  
              style="display: none;"  
              >
            </audio>
          </div>

          <div class="bottom-btn">
            <div class="create-btn" @click="backCreate">
              <div>重新上传</div>
            </div>
            <div class="create-btn" @click="createAudio">
              <div>生成我的歌声</div>
            </div>
          </div>
        </div>
        <div v-else class="log-list">
          <div class="list-con">
            <div class="p-item">
              <div class="cover">
                  <img src="../assets/1.png" alt="示例图片">
                  <div class="gist">
                    <p>请保持环境安静</p>
                    <p>避免噪音干扰</p>
                  </div>
              </div>
            </div>
            <div class="p-item">
              <div class="cover">
                  <img src="../assets/2.png" alt="示例图片">
                  <div class="gist">
                    <p>注意词语发音,要</p>
                    <p>尽量清晰哦</p>
                  </div>
              </div>
            </div>
            <div class="p-item">
              <div class="cover">
                  <img src="../assets/3.png" alt="示例图片">
                  <div class="gist">
                    <p class="gist_p">语速尽量避免拖沓</p>
                  </div>
              </div>
            </div>
            <div class="p-item">
              <div class="cover">
                  <img src="../assets/4.png" alt="示例图片">
                  <div class="gist">
                    <p>保持热情、亲切的</p>
                    <p>语调，效果最好啦</p>
                  </div>
              </div>
            </div>
            <div class="simpleMsg">
              <div class="info">
                <p>可以试着说：猜对歌曲，实现家庭梦想！开门大吉，好运登场！</p>
              </div>
              <div class="start" @click="beginSound">
                <img src="../assets/start.png" alt="">
              </div>
              <!-- 引入自定义弹框 -->
              <CustomDialog 
                v-model:visible="showModal"
                title="AI声音采集须知"
                position="center"
                confirmText="我已知晓"
                @confirm="handleConfirm"
              >
                <!-- 插槽内容 - 自定义弹框内容 -->
                <view>
                  <text >　　本服务由央视频融媒体发展有限公司（简称“央视频”或“我们”）提供，旨在通过您的许可，利用先进的AI技术，将您录制的包含您或他人的音频素材特征与您上传的图像转化为音乐MV视频，本服务是您使用咪咕音乐AI随心唱应用的必要前提。我们承诺，您录制的音频与您上传的图像将严格用于咪咕音乐AI随心唱应用服务及过程处理，不会用于其他识别用途。我们只会在达成本协议所述目的所需的期限内保留您的个人信息，对于超出期限的个人信息，我们会立即删除。您勾选“已阅读《AI随心唱声音与图像采集须知协议》并确认授权”，即代表您接受并同意遵守本协议所述条款和条件。 1、在您进入页面并勾选同意后，您需要录制您本人或您已获得合法授权的他人的声音，该声音将被用于咪咕音乐AI随心唱应用，如果您上传或拍摄了已获得合法授权的图像，该图像也将被用于咪咕音乐AI随心唱应用。 2、您确认录制的为您本人声音或您已获得合法授权的他人的声音，且确认上传的为您本人拥有版权的图像或您已获得合法授权的他人的图像。如为他人的声音或图像，您保证并承诺在录制前或上传前已获得他人授权，该授权合法有效，不存在任何瑕疵。他人的授权应至少包括以下内容： （1）他人同意参与录制或拍摄； （2）他人作为其声音和图像的权利人，就其声音与图像对您及我们授权如下： a.授权您及我们收集和使用通过本服务录制的包含其声音的素材作为训练数据使用，授权您及我们收集和使用通过本服务上传的包含其图像的素材，用于生成AI音乐MV视频，以便您可以使用咪咕音乐AI随心唱应用； b.授权您及我们可以通过目前已知或其后开发的任何合法手段、用途、媒介、方法、技术、形式等对其声音与图像进行编辑、剪辑、调整、分析、分解、计算、训练、研究等，形成得以模仿、再现其声音、音色特征的技术、技术能力或技术服务（以下简称“技术成果”），包括但不限于语音识别、语音合成（包含文字转语音（TTS）、声音复刻、音色转换、歌唱合成（SVS）、歌唱转换等）等，并利用图像制作音乐MV视频； c.授权您及我们可将技术成果结合目前已知或未来未知的人工智能等技术，生成包含其音色特征的虚拟声音（以下简称“虚拟声音”）和音乐MV视频； d.授权您及我们可以将上述技术成果、虚拟声音及音乐MV视频上线咪咕音乐AI随心唱应用及相应的技术支持平台中供您以咪咕音乐AI随心唱应用目前及未来提供的使用方式及功能进行使用，并将使用成果（即以技术成果输出的包含其声音特征的音频、包含其声音特征与图像的音乐MV视频）用于非营利目的。 3、您知悉并同意，由于我们并无法联系他人核实授权的情况，因此您通过本服务向我们提供训练数据（即录制的声音素材与上传的图像素材）即视为您确认他人已经按照本规则要求进行了授权，且相关授权符合本协议要求，您自行承担相关责任。 4、当您使用本服务时，我们可能会向咪咕音乐AI随心唱应用合作方共享您的某些信息，以保障您的服务要求得以顺利完成，并帮助我们持续升级更好的产品服务体验。我们仅会出于合法、正当、必要和诚信原则共享您的个人信息，并且只会共享服务所必要信息；同时，对接收个人信息的公司、组织和个人，我们会与其签署严格的保密协议，或要求其按照我们的约束以及其他任何相关的保密和安全措施来处理个人信息。我们的合作伙伴无权将接收的个人信息用于任何其他用途。 5、我们在本服务提供的内容（包括但不限于服务界面、技术、程序、文字、图片、图像、音频、视频、图表、版面设计、电子文档等）的知识产权属于央视频或咪咕音乐所有。央视频提供本服务所依托的软件的著作权、专利权及其他知识产权均归央视频所有。 6、未经央视频事先书面同意，您不得以任何商业目的对本服务或其任何部分进行复制、复印、仿造、出售、转售、访问、或以其他方式加以利用。未经央视频事先书面同意，您不得私自使用央视频的任何商标、服务标记、商号、域名、网站名称或其他显著品牌特征等（以下统称为“标识”）。未经央视频事先书面同意，您不得将本条款前述标识以单独或结合任何方式展示、使用或申请注册商标、进行域名注册等，也不得实施向他人明示或暗示有权展示、使用、或其他有权处理该些标识的行为。由于您违反本协议使用本服务或标识等给央视频或他人造成损失的，由您承担全部法律责任。 7、您知悉并同意，我们提供的本服务是按照现有技术和条件所能达到的现状提供的，我们会尽最大努力向您提供服务，确保服务的连贯性和安全性，但基于互联网的特殊性，央视频不担保本功能不会中断，也不担保本功能的及时性和/或安全性。 8、您理解并同意，央视频基于经营策略的调整，可能会对本服务进行变更，也可能会中断、中止或终止服务。在央视频发生合并、分立、收购、资产转让时，央视频可向第三方转让本服务下相关资产；央视频也可在单方通知您后，将本协议约定的部分或全部服务及相应的权利义务转交由第三方运营或履行。 9、如发生下列任何一种情形，央视频有权不经通知而中断或终止向您提供本服务： （1）您未取得他人的授权、授权不符合本协议要求或者他人发起维权。 （2）您违反相关法律法规的规定或违反本协议的约定。 （3）按照法律法规规定，司法机关或主管部门的要求。 （4）出于安全的原因或其他必要的情形。 10、如您违反本协议或其他服务条款，央视频有权独立判断并视情况采取预先警示、拒绝服务、短期禁止服务、限制账号部分或者全部功能直至终止提供服务等措施，对于因此而造成您无法正常使用相关服务或其他权益等后果，央视频不承担任何责任。央视频有权根据实际情况决定是否恢复服务。对涉嫌违反法律法规、涉嫌违法犯罪的行为，央视频将保存有关记录，并有权依法向有关主管部门报告、配合有关主管部门调查、向公安机关报案等。对已删除内容央视频有权不予恢复。 11、因您违反本协议或其他服务条款规定，引起第三方投诉或诉讼索赔的，您应当自行处理并承担可能因此产生的全部法律责任。因您的行为导致央视频及其关联方、控制公司、继承公司向任何第三方赔偿或遭受国家机关处罚的，您还应足额赔偿央视频及其关联方、控制公司、继承公司因此遭受的全部损失。 12、央视频尊重并保护您及他人的知识产权、名誉权、姓名权、隐私权、肖像权等合法权益。您保证，在使用本服务时不侵犯任何第三方的知识产权、名誉权、姓名权、隐私权、肖像权等权利及合法权益。否则，央视频有权在收到权利方或者相关方通知的情况下移除该涉嫌侵权内容。针对第三方提出的全部权利主张，您应自行处理并承担可能因此产生的全部法律责任；如因您的侵权行为导致央视频及其关联方、控制公司、继承公司遭受损失的（包括但不限于经济、商誉等损失），您还应足额赔偿央视频及其关联方、控制公司、继承公司遭受的全部损失。 13、您知悉并同意，央视频可根据情况对本协议进行修改。一旦本协议的内容发生变动，央视频将通过官方网站或软件内部弹出窗口等方式公布最新的协议，不再向您作个别通知。如果您不同意央视频对本协议所做的修改，您有权停止使用本服务。如果您继续使用本服务，则视为您接受央视频对本协议所做的修改，并应遵照修改后的协议执行。 14、本协议为《咪咕用户协议》、《咪咕音乐隐私政策》和《咪咕音乐极速版隐私政策》之附件，与之具有同等效力，本协议与《咪咕用户协议》、《咪咕音乐隐私政策》和《咪咕音乐极速版隐私政策》冲突的，以本协议为准，本协议未提及或未明确的以《咪咕用户协议》、《咪咕音乐隐私政策》和《咪咕音乐极速版隐私政策》为准。</text>
                </view>
              </CustomDialog>
              <SoundBegin
                v-model:visible="showFlag"
                :avatarId="avatarId"
                :musicId="musicId"
                :projectId="projectId"
                :token="token"
                :vuid="vuid"
                :taskId="taskId"
                @confirm="handleEnd"
              >

              </SoundBegin>
            </div>
            <div class="endCon">
              <div class="agree">
                <input type="checkbox" id="agreement" v-model="isChecked"  name="agreeInput" value="">

                <!-- <div> -->
                  <label for="agreement">
                    <span>我同意</span>
                    <span class="aiHigh">《AI我是歌王》</span>
                    <span>并确认授权由华技有限公司提供以上服务，您所上传的音频将仅被用于本活动，我们仅提供AI内容创作服务，不会用于识别用途。</span>
                  </label>
                  
                <!-- </div> -->
              </div>
            </div>
            <!-- 弹框组件 -->
        </div>
        </div>
    </div>
    </div>
</template>

<style scoped lang="less">
  .audio-cover{
    display: flex;
    flex-direction: column;
    align-items: center;

    position: relative; 
    width: 300px; 
    height: 300px; 
    border-radius: 25px;
    overflow: hidden; 
    top:50%
  }
  .cover-img{
    width:100%;
    height:100%;
    border-radius: 25px;
    object-fit: cover; /* 核心：保持比例，填满容器 */
  }
  .play-btn{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%); /* 精确居中（关键） */
  }
  /* 播放/暂停图标样式 */
  .play-btn img {
    width: 70px;
    height: 70px;
    object-fit: contain;
  }
  .bottom-btn{
    display: flex;
    // flex-direction: column;
    position: absolute;
    z-index: 3;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
  }
  .create-btn{
    margin-bottom: 100px;
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
  .bottom-btn .create-btn:first-child{
    margin-right: 20px;
  }
.ghimg{
  width: 100%;
  height: 100%;
  font-size: 12px;

  background: url("../assets/xuzhi.png") no-repeat 0 0;
}
.info{
  padding: 0 10px;
}
.start {
  margin-top: 10px;
  img{
    width:300px;
    max-width: 300px;
    height: 50px;
  }
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
    width: 174px;
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
  margin-top: 35px;
  position: relative;
  z-index: 1;
  .list-con{
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
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
        height: 100%;
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
// .nextCon{
  
// }
.logs{
  width: 0;
  height: 100vh;
  overflow-y: auto;
  padding: 0;
  position: absolute;
  top: 0;
  left: 100%;
  // background: url("../assets/bg_black.png") no-repeat 0 0;
  background-size: 100% 100%!important;
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
    color: #fff;
    .list-con{
      // opacity: 0.7;
      // background: #29427C;
      // background: linear-gradient(10deg, rgba(0, 0, 0, 0) 0%, #000 100%);
      // box-shadow: 0px 0px 10px #000;
      // backdrop-filter: blur(5px);
      // height: 100%;
      .p-item{
        .cover{
          // height: auto;
          img{
            width: 100%;
            height: 100%;
            border-radius: 8px;
            position: relative;
            // border: solid red;
            opacity: 1;
          }
          >.gist{
            height: 26%;
            width: 100%;
            background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, #000000 100%);
            font-size: 16px;
            // color: #fff;
            position: absolute;
            bottom: 0px;
            // left: 16px;
            >p{
              text-align: center;
              line-height: 1.5;
            }
            >p:first-child{
              padding-top: 5px;
            }
            .gist_p{
              padding-top: 18px!important;
            }
          }
        }
      }
      .simpleMsg{
        display: flex;
        flex-direction: column;
        align-items: center;


      }
      .create-btn{
        padding-top: 24px;
        >div{
          height: 50px;
          line-height: 50px;
          width: 284px;
          text-align: center;
          margin: auto;
          // background: linear-gradient(90deg, #5DF7FC 0%, #FFFFFF 98%);
          background: linear-gradient(90deg, #5DF7FC 0%, #FFFFFF 98%), #D8D8D8;
          background-size: 100% 100%;
          font-size: 18px;
          color: #000;
          border-radius: 25px;
          box-sizing: border-box;
          border: 2px solid transparent;
          border-image: linear-gradient(90deg, #5DF7FC 0%, #FFFFFF 98%) 2 ;
          border-image-outset: 5px; //四边外扩
          // border-image-slice: 1% round;
          background-origin: padding-box,border-box;
          background-clip: padding-box, border-box;
          // border-image-width: auto 20px; //边框宽度和边框外扩距离

        }
      }
      .endCon{
        padding-top: 16px;
        .aiHigh{
          color: #FAFE45;
        }
      }
    }
    .list-con::before{
      background: linear-gradient(10deg, rgba(0, 0, 0, 0) 0%, #000 100%);
      // opacity: 0.7;
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
    // flex-direction: column;
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
