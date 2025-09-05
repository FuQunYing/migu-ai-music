<template>
  <view class="record-page">
    <!-- 触发按钮 -->
    <!-- <button class="open-record-btn" @click="showRecordDialog = true">
      点击打开录音弹框
    </button> -->

    <!-- 录音弹框 -->
    <view class="record-dialog-mask" v-if="visible" >
      <view class="record-dialog-container">
        <!-- <view class="dialog-close-btn" @click="closeRecordDialog">✕</view> -->
        <!-- v-if="isRecording" -->
        <view class="waveform">
          <view 
            class="wave-bar" 
            v-for="(h, i) in waveHeights" 
            :key="i" 
            :style="{ height: h + 'px' }"
          ></view>
        </view>
        <view class="record-result" v-if="recordedBlob">
          <!-- <view class="result-tip">录音已完成</view> -->
          <audio :src="audioUrl" controls class="audio-player"></audio>
        </view>
        <!-- 错误提示 -->
        <view class="error-message" v-if="errorMessage">
          {{ errorMessage }}
        </view>

        <view 
          class="record-btn"
          :class="{ recording: isRecording }"
          @touchstart.prevent="startRecording"
          @touchend.prevent="stopRecording"
          @touchcancel.prevent="stopRecording"
          @mousedown.prevent="startRecording"
          @mouseup.prevent="stopRecording"
          @mouseleave.prevent="stopRecording"
        >
          <view class="record-time" v-if="isRecording">
            {{ formatTime(recordDuration) }}
          </view>
          <view class="mic-icon"></view>
          <view class="record-status">
            {{ isRecording ? '松开录制完毕' : '长按按钮开始录音' }}
          </view>
        </view>
       
        

        
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onUnmounted } from 'vue';
import { defineProps, defineEmits,watch } from 'vue'
// 弹框状态
// const visible = ref(false);
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  avatarId: {
    type: String,
    default: ''
  },
  musicId: {
    type: String,
    default: ''
  },
  projectId: {
    type: String,
    default: ''
  },
  token: {
    type: String,
    default: ''
  },
  vuid: {
    type: String,
    default: ''
  },
  taskId: {
    type: String,
    default: ''
  }
})
// 录音状态
const isRecording = ref(false);
const recordDuration = ref(0);
const recordedBlob = ref(null);
const audioUrl = ref('');
const mediaRecorder = ref(null);
const timer = ref(null);
const waveHeights = ref([]);
const errorMessage = ref('');
const sendUrl = ref('');
const emitEvent = defineEmits(['close', 'update:visible', 'confirm'])
const objectNew = ref({});

// 格式化时间
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

// 生成波形
const generateWaveform = () => {
  if (!isRecording.value) return;
  
  const newHeights = Array.from({ length: 20 }, () => 
    Math.floor(Math.random() * (30 + recordDuration.value / 2)) + 10
  );
  waveHeights.value = [10, 20, 30, 40, 50, 40, 30, 20, 10, 20, 30, 40, 50, 40, 30, 20, 10, 20, 30, 40];

  waveHeights.value = newHeights;
  requestAnimationFrame(() => {
    if (isRecording.value) setTimeout(generateWaveform, 100);
  });
};

// 检测浏览器支持的音频格式
const getSupportedMimeType = () => {
  // 常用音频格式，按优先级排序
  const mimeTypes = [
    'audio/webm',
    'audio/mp4',
    'audio/wav',
    'audio/ogg'
  ];
  
  for (const type of mimeTypes) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  
  // 如果没有找到支持的格式，返回null
  return null;
};
const handleClose = () => {
  emitEvent('close')
  emitEvent('update:visible', false)
}
// 监听状态变化（用于调试）
watch(isRecording, (newVal) => {
  console.log('录音状态', newVal)
  if(!newVal){
    handleEnd()
  }
})

const handleEnd = () => {
    console.log('录音结束',audioUrl)
    const mimeType = getSupportedMimeType();
    console.log('mimeType', mimeType.split('/')[1])
    console.log('sendUrl', sendUrl)
    // 格式化音频文件 转为 format-data 格式
    emitEvent('confirm',sendUrl)
    
    handleClose()
}


// 开始录音
const startRecording = async () => {
  if (isRecording.value) return;
  
  // 清除之前的错误信息
  errorMessage.value = '';
  
  try {
    // 检查浏览器是否支持MediaRecorder
    if (!window.MediaRecorder) {
      throw new Error('您的浏览器不支持录音功能，请更换现代浏览器');
    }
    
    // 获取支持的音频格式
    const mimeType = getSupportedMimeType();
    if (!mimeType) {
      throw new Error('您的浏览器不支持任何音频录制格式');
    }
    
    // 获取麦克风权限
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,  // 开启回声消除
        noiseSuppression: true   // 开启噪音抑制
      } 
    });
    
    // 创建录音器，使用浏览器支持的格式
    console.log('mimeType', mimeType)
    mediaRecorder.value = new MediaRecorder(stream, { mimeType });
    const audioChunks = [];
    
    mediaRecorder.value.ondataavailable = (e) => audioChunks.push(e.data);
    
    mediaRecorder.value.onstop = () => {
      recordedBlob.value = new Blob(audioChunks, { type: mimeType });
      audioUrl.value = URL.createObjectURL(recordedBlob.value);
      sendUrl.value = blobToFormData(audioUrl.value,mimeType.split('/')[1])
      // console.log('audioUrl', audioUrl)
      stream.getTracks().forEach(track => track.stop());
    };
    
    // 开始录音
    mediaRecorder.value.start();
    isRecording.value = true;
    recordDuration.value = 0;
    
    // 启动计时器
    timer.value = setInterval(() => {
      recordDuration.value++;
      if (recordDuration.value >= 30) stopRecording();
    }, 1000);
    
    // 启动波形动画
    generateWaveform();

  } catch (err) {
    console.error('录音失败：', err);
    errorMessage.value = err.message || '录音失败，请重试';
    isRecording.value = false;
  }
};

// 1. 通过 Blob URL 获取原始 Blob 对象
const getBlobFromUrl = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("获取 Blob 失败，Blob URL 可能已过期");
    }
    // 将响应转换为 Blob 对象（可指定 MIME 类型，如音频用 'audio/webm'）
    const blob = await response.blob();
    return blob;
  } catch (err) {
    console.error("获取 Blob 错误：", err);
    return null;
  }
};
// 2. 将 Blob 转换为 FormData
const blobToFormData = async (audioUrl, fileName) => {
  const taskId = localStorage.getItem('taskId');
  const blob = await getBlobFromUrl(audioUrl);
  console.log('blob', blob)
  if (!blob) return null;

  const formData = new FormData();
  // 关键：append(键名, Blob 对象, 文件名)
  // 键名（如 'audioFile'）需与后端接口参数名一致
  console.log('fileName',`file.${fileName}`) 
  formData.append("file", blob, `file.${fileName}`);
  // formData.append('url', props.imgUrl); 
  formData.append('avatarId', props.avatarId); 
  formData.append('musicId', props.musicId);
  // formData.append('projectId', props.projectId);
  formData.append('token', props.token);
  formData.append('vuid', props.vuid);
  formData.append('taskId', taskId);
  formData.append('projectId', AI_YS_WSGW);
  // formData.append('fileName', 'file.webm');
  // objectNew.vuid = props.vuid
  // objectNew.pageSize = 10
  // objectNew.pageNum = 1
  // formData.append('Qo', objectNew);

  return formData;
};

// 停止录音
const stopRecording = () => {
  if (!isRecording.value || !mediaRecorder.value) return;

  if (mediaRecorder.value.state !== 'inactive') {
    mediaRecorder.value.stop();
  }
  
  clearInterval(timer.value);
  isRecording.value = false;
  waveHeights.value = [];
};

// 关闭弹框
const closeRecordDialog = () => {
  stopRecording();
  // visible.value = false;
  handleClose()
  recordedBlob.value = null;
  errorMessage.value = '';
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value);
    audioUrl.value = '';
  }
};

// 组件卸载时清理
onUnmounted(() => {
  stopRecording();
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value);
  }
});
</script>

<style scoped>
.record-page {
  padding: 60rpx 30rpx;
  max-height: 100vh;
  background-color: #f5f5f5;
}

.open-record-btn {
  width: 100%;
  padding: 24rpx 0;
  background-color: #007aff;
  color: #fff;
  font-size: 32rpx;
  border-radius: 12rpx;
  border: none;
}

.record-dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding: 30rpx;
  box-sizing: border-box;
  z-index: 9999;
}

.record-dialog-container {
  width: 100%;
  max-width: 500rpx;
  /* background-color: #fff; */
  border-radius: 20rpx;
  padding: 50rpx 30rpx;
  position: relative;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.3);
}

.dialog-close-btn {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  font-size: 36rpx;
  color: #999;
  cursor: pointer;
  user-select: none;
}

.record-status {
  font-size: 32rpx;
  color: #fff;
  text-align: center;
  margin-bottom: 40rpx;
  font-weight: 500;
}

.record-time {
  font-size: 60rpx;
  color: #fff;
  font-weight: bold;
  text-align: center;
  margin-bottom: 50rpx;
}

.waveform {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  height: 150px;
  width: 100%;
  margin-bottom: 60px;
}

.wave-bar {
  width: 8px;
  background-color: #007aff;
  border-radius: 4px;
  transition: height 0.1s ease;
}

.record-btn {
  width: 180px;
  height: 180px;
  /* border-radius: 50%; */
  /* background-color: #ff4d4f; */
  
  margin: 40px auto;
  display: flex;
  /* justify-content: center;
  align-items: center; */
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  user-select: none;
  /* box-shadow: 0 6rpx 15rpx rgba(255, 77, 79, 0.4); */
  transition: all 0.2s ease;
}

.record-btn.recording {
  /* background-color: #ff3333; */
  /* background: url('../assets/begin.png') no-repeat center / cover; */
  transform: scale(0.95);
  box-shadow: 0 6rpx 20rpx rgba(255, 51, 51, 0.6);
}

.mic-icon {
  width: 90px;
  height: 90px;
  font-size: 60rpx;
  /* color: #fff; */
  background: url('../assets/begin.png') no-repeat center / cover;
}

.record-result {
  margin-top: 50rpx;
  width: 100%;
  text-align: center;
}

.result-tip {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
}

.audio-player {
  width: 100%;
  height: 60rpx;
}

/* 错误提示样式 */
.error-message {
  margin-top: 30rpx;
  color: #ff4d4f;
  font-size: 28rpx;
  text-align: center;
  padding: 0 20rpx;
}
</style>
