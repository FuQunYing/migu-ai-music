import { defineStore } from 'pinia';

// 定义全局音频状态（存储 FormData 等复杂数据）
export const useAudioStore = defineStore('audio', {
  state: () => ({
    // 存储录音生成的 FormData
    audioFormData: null,
    // 存储其他需要跨页面传递的参数（可选，减少路由 query 冗余）
    audioRelatedParams: {
      url: '',
      avatarId: '',
      musicId: '',
      projectId: '',
      token: '',
      vuid: ''
    }
  }),
  actions: {
    // 设置音频 FormData
    setAudioFormData(formData) {
      this.audioFormData = formData;
    },
    // 设置关联参数
    setAudioRelatedParams(params) {
      this.audioRelatedParams = { ...this.audioRelatedParams, ...params };
    },
    // 清空状态（避免内存泄漏）
    clearAudioState() {
      this.audioFormData = null;
      this.audioRelatedParams = {};
    }
  }
});