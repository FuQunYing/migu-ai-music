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
</style>
