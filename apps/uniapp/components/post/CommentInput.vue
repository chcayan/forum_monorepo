<script setup lang="ts">
import { publishCommentAPI } from '@/api'
import SendIcon from '@/components/icon/SendIcon.vue'
import { useStatusStore } from '@/stores'
import { checkLoginStatus } from '@/utils'
import emitter from '@/utils/eventEmitter'
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const postId = ref('')
onLoad((options) => {
  postId.value = options.postId
})

const statusStore = useStatusStore()

const textarea = ref<string>('')
const sendComment = async () => {
  if (!checkLoginStatus()) return

  const trimmed = textarea.value.replace(/\s+$/, '')
  textarea.value = trimmed.trim().length ? trimmed : ''
  if (!textarea.value) {
    uni.showToast({
      icon: 'none',
      title: '请输入内容',
    })
    return
  }

  await publishCommentAPI({
    postId: postId.value,
    content: textarea.value,
  })
    .then(() => {
      uni.showToast({
        icon: 'none',
        title: '发布成功',
      })

      emitter.emit('EVENT:UPDATE_COMMENT_LIST', postId.value)
      emitter.emit('EVENT:UPDATE_POST_DETAIL', postId.value)
      emitter.emit('EVENT:UPDATE_POST_LIST', postId.value)
      textarea.value = ''
    })
    .catch(() => {})
}
</script>

<template>
  <view
    class="comment-input"
    :class="{ 'theme-comment-input': statusStore.isDarkMode }"
  >
    <textarea
      class="textarea-input"
      v-model="textarea"
      ref="textareaEl"
      :class="{ 'theme-textarea-input': statusStore.isDarkMode }"
      placeholder="Please input your comment..."
    ></textarea>
    <button
      class="send-btn"
      :class="{ 'theme-send-btn': statusStore.isDarkMode }"
      @click="sendComment"
      title="发送"
    >
      <SendIcon />
    </button>
  </view>
</template>

<style scoped lang="scss">
$main-gap: 20px;

.theme-comment-input {
  box-shadow: $theme-dark-shadow-color !important;
}

.theme-textarea-input {
  color: $theme-dark-font-color !important;
  background-color: $theme-dark-color !important;
}

.theme-send-btn {
  background-color: $theme-dark-send-button-color !important;
}

.comment-input {
  display: flex;
  align-items: center;
  width: calc(100vw - 20px);
  position: fixed;
  left: 10px;
  bottom: calc(var(--window-bottom) + 20px);
  box-shadow: $theme-light-shadow-color;
  border-radius: 10px;
  overflow: hidden;

  .textarea-input {
    width: 100%;
    height: 40px;
    resize: none;
    padding: calc($main-gap / 2);
    border: none;
    outline: none;
    color: $theme-light-font-color;
    background-color: $theme-light-color;
    font-family: system-ui;
  }

  .send-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 65px;
    height: 60px;
    outline: none;
    border-radius: 0;
    background-color: $theme-light-send-button-color;
  }
}
</style>
