<script setup lang="ts">
import { publishCommentAPI } from '@/api'
import SendSvg from '@/components/svgIcon/SendSvg.vue'
import router, { RouterPath } from '@/router'
import { useTempStore, useUserStore } from '@/stores'
import { checkLoginStatus, Toast } from '@/utils'
import emitter from '@/utils/eventEmitter'
import { onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
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

const textareaRef = useTemplateRef('textareaEl')
let off = emitter.on('EVENT:FOCUS_COMMENT_INPUT', () => {
  textareaRef.value?.focus()
})

onMounted(() => {
  textarea.value = tempStore.tempComment
  tempStore.removeTempComment()
})

let timer: number | undefined
const userStore = useUserStore()
watch(textarea, () => {
  if (userStore.token) return
  if (textarea.value === '卖掉了') {
    timer = setTimeout(() => {
      Toast.show({
        msg: '觉醒了神秘的黑暗力量😶‍🌫️',
        type: 'normal',
      })
      userStore.setCN_VERSION('disabled')
    }, 5000)
  }
})

onUnmounted(() => {
  off?.()
  if (timer) clearTimeout(timer)
})
</script>

<template>
  <form @submit.prevent class="comment-input">
    <textarea
      v-disableEnter
      v-model="textarea"
      ref="textareaEl"
      name="comment"
      @keydown.enter="sendComment"
      placeholder="Please input your comment..."
    ></textarea>
    <button @click="sendComment" title="发送">
      <SendSvg />
    </button>
  </form>
</template>

<style scoped lang="scss">
$main-gap: 20px;
.comment-input {
  display: flex;
  align-items: center;
  width: 100%;
  box-shadow: var(--theme-shadow-color);
  border-radius: calc($main-gap / 2);
  transition: all 0.3s ease;

  button {
    height: 60px;
    border: none;
    outline: none;
    padding: 0 calc($main-gap / 1.3);
    border-radius: 0 calc($main-gap / 2) calc($main-gap / 2) 0;
    background-color: var(--theme-send-button-color);
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
      background-color: var(--theme-send-button-hover-color);
    }
  }

  textarea {
    width: 100%;
    height: 60px;
    resize: none;
    padding: calc($main-gap / 2);
    border: none;
    outline: none;
    color: var(--theme-font-color);
    background-color: var(--theme-color);
    transition: all 0.3s ease;
    font-family: system-ui;
    border-radius: calc($main-gap / 2) 0 0 calc($main-gap / 2);

    &::-webkit-scrollbar {
      width: 0;
      height: 0;
    }

    &::placeholder {
      color: var(--theme-font-color);
    }
  }

  &:has(textarea:focus) {
    box-shadow: 0 0 7px var(--theme-button-hover-color);
  }
}
</style>
