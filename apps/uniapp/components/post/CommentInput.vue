<script setup lang="ts">
import { publishCommentAPI } from '@/api'
import SendIcon from '@/components/icon/SendIcon.vue'
import { useTempStore, useStatusStore } from '@/stores'
// import { checkLoginStatus, Toast } from '@/utils'
import emitter from '@/utils/eventEmitter'
import { onMounted, onUnmounted, ref } from 'vue'
const statusStore = useStatusStore()

const tempStore = useTempStore()
function navigateToLogin() {
  if (textarea.value) {
    tempStore.setTempComment(textarea.value)
  }
  router.replace(`${RouterPath.login}?redirect=${route.path}`)
}

const textarea = ref<string>('')
const sendComment = async (e: KeyboardEvent | MouseEvent) => {
  if (e instanceof KeyboardEvent) {
    if (e.key === 'Enter' && e.shiftKey) return
  }
  if (!checkLoginStatus(navigateToLogin)) return

  const trimmed = textarea.value.replace(/\s+$/, '')
  textarea.value = trimmed.trim().length ? trimmed : ''
  if (!textarea.value) {
    Toast.show({
      msg: '请输入内容',
      type: 'error',
    })
    return
  }

  const postId = route.params.postId as string
  await publishCommentAPI({
    postId,
    content: textarea.value,
  })
  Toast.show({
    msg: '发布成功',
    type: 'success',
  })
  emitter.emit('EVENT:UPDATE_COMMENT_LIST')
  emitter.emit('EVENT:UPDATE_POST_DETAIL', postId)
  emitter.emit('EVENT:UPDATE_POST_LIST', postId)
  textarea.value = ''
}

const textareaEl = ref(null)
let off = emitter.on('EVENT:FOCUS_COMMENT_INPUT', () => {
  textareaEl.value?.focus()
})

onMounted(() => {
  textarea.value = tempStore.tempComment
  tempStore.removeTempComment()
})

onUnmounted(() => {
  off?.()
})
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
