<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const videoUrl = ref(route.query.url);

const closeVideo = () => {
  router.back();
};
</script>

<template>
    <div class="index-container">
      <div class="play-video-modal">
        <div class="close" @click="closeVideo"><img src="../assets/close.png" alt=""></div>
        <video :src="videoUrl" controls autoplay></video>
        <div class="ai_msg">
            <img src="../assets/ai_msg.png" alt="">
          </div>
          <div class="ai_span">
            <span>内容由AI生成</span>
          </div>
      </div>
    </div>
</template>

<style scoped>
.index-container{
  width: 100vw;
  overflow-x: hidden;
}

.play-video-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.close {
  position: absolute;
  top: 20px;
  right: 20px;
  cursor: pointer;
  z-index: 1001;
}

.close img {
  width: 30px;
  height: 30px;
}

video {
  max-width: 90%;
  max-height: 90%;
}

.ai_msg {
  position: absolute;
  bottom: 20px;
  left: 40px;
  z-index: 1001;
}

.ai_msg img {
  width: 70px;
  height: 23px;
}

.ai_span {
  position: absolute;
  bottom: 20px;
  right: 40px;
  z-index: 1001;
}

.ai_span span {
  color: #d1d1d1;
  font-size: 12px;
  opacity: 0.9;
}
</style>
