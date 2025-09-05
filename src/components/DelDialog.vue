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
          <div class="create-btn"  @click="handleCancel">
            <div>取消</div>
          </div>
          <div class="create-btn" @click="handleConfirm" style="margin-left: 10px;">
            <div>确认</div>
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
  },
  selectId: {
    type: String,
    default: ''
  },
})

const emitEvent = defineEmits(['close', 'update:visible', 'confirm'])

const handleClose = () => {
  emitEvent('close')
  emitEvent('update:visible', false)
}

const handleConfirm = () => {
  emitEvent('confirm',{selectId:props.selectId})
  handleClose()
}
const handleCancel = () => {
  emitEvent('cancel')
  handleClose()
}
</script>

<style scoped lang="less">
  .create-btn div{
    height: 50px;
    line-height: 50px;
    width: 142px;
    text-align: center;
    margin: auto;
    background: url("../assets/btn-bg.png") no-repeat 0 0;
    background-size: 100% 100%;
    font-size: 18px;
    color: #fff;
  }
  .create-btn{
    // margin-bottom: 100px;
    &:first-child{
      background: #fff;
      border-radius: 25px;
      >div{
        color: #0290FE!important;
        background-image: none;
        margin-left:10px;
      }
    }
  }
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgb(0 0 0 / 2%);
  display: flex;
  justify-content: center;
  align-items: center;
}

.dialog-wrapper {
  /* width: calc(100% - 60px); */
  width: 100%;
  max-width: 400px;
  width: calc(100% - 60rpx);
  max-width: 600rpx;
  background: url("../assets/del.png") no-repeat 0 0;
  background-size: contain;
  /* display: flex;
  justify-content: center; */
}

.dialog-container {
  width: 100%;
  max-width: 375px;
  min-height: 194px;
  max-height: 80vh; /* 最大高度不超过视口的80% */

  height: 194px;
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
  color: #fff;
  font-size: 30rpx;
  line-height: 1.8;
  text-align: center;
  z-index: 2;
  /* flex: 1; */
  /* border:solid; */
  position: absolute;
  left: 46px;
  top: 60px;
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
  bottom: 0px;
  z-index: 2;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  left: 50%;
  transform: translate(-50%, -50%); 
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

