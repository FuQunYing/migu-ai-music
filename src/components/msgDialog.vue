<template>
  <view 
    v-if="visible" 
    class="dialog-overlay"
    @click.self="handleClose"
    :style="{ zIndex: zIndex }"
  >
    <view class="dialog-wrapper">
      <view class="dialog-container">
        <view class="dialog-content">
          <view class="scrollable-content">
            <slot>默认弹窗内容</slot>
          </view>
        </view>
        <view class="dialog-footer">
          <div class="create-btn" @click="handleConfirm">
            <div>{{ confirmText }}</div>
          </div>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  confirmText: {
    type: String,
    default: '确认'
  },
  // backgroundImage: {
  //   type: String,
  //   default: 'https://picsum.photos/800/600'
  // },
  // 图片适配方式：contain(完整显示)、cover(覆盖)、fill(拉伸)
  imageFit: {
    type: String,
    default: 'contain', // 默认完整显示图片
    validator: (value) => ['contain', 'cover', 'fill', 'none', 'scale-down'].includes(value)
  },
  // 图片定位
  imagePosition: {
    type: String,
    default: 'center center'
  },
  // 自定义背景图片样式
  bgImageStyle: {
    type: Object,
    default: () => ({})
  },
  borderColor: {
    type: String,
    default: ''
  },
  borderWidth: {
    type: String,
    default: '2px'
  },
  zIndex: {
    type: Number,
    default: 999
  }
})

const emitEvent = defineEmits(['close', 'update:visible', 'confirm'])

const handleClose = () => {
  emitEvent('close')
  emitEvent('update:visible', false)
}

const handleConfirm = () => {
  emitEvent('confirm')
  handleClose()
}
</script>

<style scoped>
  .create-btn div{
    height: 50px;
    line-height: 50px;
    width: 284px;
    text-align: center;
    margin: auto;
    /* background: url("../assets/btn-bg.png") no-repeat 0 0; */
    /* background-size: 100% 100%; */
    border: 1px solid #333;
    border-radius: 10px;
    font-size: 18px;
    color: #333;
  }
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
}

.dialog-wrapper {
  /* width: calc(100% - 60px); */
  width: 100%;
  max-width: 600px;
  width: calc(100% - 60rpx);
  max-width: 600rpx;
  /* background: url("../assets/xuzhi.png") no-repeat 0 0; */
  background-size: cover;
  display: flex;
  justify-content: center;
}

.dialog-container {
  width: 100%;
  max-width: 375px;
  min-height: 400px;
  max-height: 80vh; /* 最大高度不超过视口的80% */
  background:#f0f0f0;
  height: 500px;
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.3);
  /* border: v-bind(borderWidth) solid v-bind(borderColor); */
  
}

.dialog-content {
  padding: 40rpx 30rpx;
  color: #242E49;
  font-size: 30rpx;
  line-height: 1.8;
  text-align: left;
  z-index: 2;
  /* flex: 1; */
  /* border:solid; */
  position: absolute;
  left: 46px;
  top: 52px;
  width: 300px;
  min-width: 300px;
  height: 350px;
  overflow: scroll;
}

.scrollable-content {
  height: 100%;
  overflow-y: scroll;
  padding-right: 10rpx;
  -webkit-overflow-scrolling: touch;
  /* border: solid red; */
}

.dialog-footer {
  padding: 20rpx 30rpx;
  position: absolute;
  bottom: 16px;
  z-index: 2;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.dialog-btn-confirm {
  width: 33.333%;
  padding: 24rpx 0;
  font-size: 32rpx;
  color: #fff;
  background-color: rgba(0, 122, 255, 0.9);
  border-radius: 60rpx;
  border: none;
  outline: none;
}

@media (min-width: 768px) {
  .dialog-wrapper {
    /* width: calc(100% - 60px); */
    width: 100%;
    max-width: 500px;
  }
}
</style>

