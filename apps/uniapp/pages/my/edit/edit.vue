<script setup lang="ts">
import { ref, toRaw } from 'vue'
import { useStatusStore, useUserStore } from '@/stores'
import uniFilePicker from '@/uni_modules/uni-file-picker/components/uni-file-picker/uni-file-picker.vue'
import { updateUserInfoAPI } from '@/api'
const statusStore = useStatusStore()

const userStore = useUserStore()

function toRawArray(filesList: Array) {
  let array = []
  filesList.forEach((item: Object) => {
    array.push(toRaw(item.file))
  })
  return array
}

const name = ref('')
const signature = ref('')
const avatar = ref(null)
const bg = ref(null)

let flag = true
const save = async () => {
  if (
    (!name.value.trim() || name.value.trim() === userStore.userInfo.username) &&
    (!signature.value.trim() ||
      signature.value.trim() === userStore.userInfo.signature) &&
    !toRawArray(avatar.value.filesList).length &&
    !toRawArray(bg.value.filesList).length
  ) {
    uni.showToast({
      icon: 'none',
      title: '什么都没更新呢',
    })
    return
  }

  if (!flag) return
  flag = false
  try {
    await updateUserInfoAPI({
      username: name.value.trim() || userStore.userInfo.username,
      sex: userStore.userInfo.sex,
      signature: signature.value.trim() || userStore.userInfo.signature,
      avatar: toRawArray(avatar.value.filesList)[0] || null,
      bgImg: toRawArray(bg.value.filesList)[0] || null,
    })
    await userStore.getUserInfo()
    uni.showToast({
      icon: 'none',
      title: '更新成功',
    })
    uni.navigateBack()
  } catch (e) {
    uni.showToast({
      icon: 'none',
      title: '更新失败',
    })
  } finally {
    flag = true
  }
}
</script>

<template>
  <view class="edit-view" :class="{ theme: statusStore.isDarkMode }">
    <view class="box">
      <text>昵称</text>
      <input
        class="input"
        v-model="name"
        type="text"
        maxlength="16"
        :placeholder="userStore.userInfo.username"
      />
    </view>
    <view class="line" :class="{ 'theme-line': statusStore.isDarkMode }"></view>
    <view class="box">
      <text>简介</text>
      <input
        class="input"
        v-model="signature"
        maxlength="30"
        type="text"
        :placeholder="userStore.userInfo.signature"
      />
    </view>
    <view class="line" :class="{ 'theme-line': statusStore.isDarkMode }"></view>
    <view class="box avatar">
      <text>头像</text>
      <uni-file-picker
        ref="avatar"
        limit="1"
        class="picker"
        :del-icon="false"
        disable-preview
        file-mediatype="image"
        ><text style="opacity: 0.6">选择头像</text></uni-file-picker
      >
    </view>
    <view class="line" :class="{ 'theme-line': statusStore.isDarkMode }"></view>
    <view class="box avatar">
      <text>背景</text>
      <uni-file-picker
        ref="bg"
        limit="1"
        class="picker"
        :del-icon="false"
        disable-preview
        file-mediatype="image"
        ><text style="opacity: 0.6">选择背景</text></uni-file-picker
      >
    </view>
    <view
      :class="{ 'theme-save': statusStore.isDarkMode }"
      class="save"
      @click="save"
    >
      保存
    </view>
  </view>
</template>

<style lang="scss" scoped>
.theme {
  background-color: $theme-dark-color !important;
}

.theme-save {
  box-shadow: $theme-dark-shadow-color !important;
  background-color: $theme-dark-button-color !important;
  color: black;
}

.theme-line {
  background-color: #3c3c3c !important;
}

.edit-view {
  min-height: calc(100vh - var(--window-top) - 20px);
  max-height: calc(100vh - var(--window-top) - 20px);
  padding: 10px;

  .line {
    margin: 10px 2px;
    background-color: #efefef;
    height: 1px;
  }

  .avatar {
    position: relative;
    height: 100px !important;

    .picker {
      margin-top: 10px;
      height: 100px;
    }
  }

  .box {
    font-size: 16px;
    padding: 0 5px;
    display: flex;
    align-items: center;
    height: 40px;
    gap: 10px;

    .input {
      font-size: 16px;
      text-align: right;
      padding-right: 5px;
      margin-left: auto;
      width: 250px;
      max-width: 250px;
    }
  }

  .save {
    position: fixed;
    z-index: 100;
    left: 10px;
    bottom: calc(var(--window-bottom) + 10px);
    width: calc(100% - 20px);
    height: 40px;
    line-height: 40px;
    text-align: center;
    border-radius: 10px;
    font-weight: bold;
    font-size: 16px;
    box-shadow: $theme-light-shadow-color;
    background-color: $theme-light-button-color;
  }
}
</style>
