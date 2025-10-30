<script setup lang="ts">
import { publishCommentAPI } from '@/api'
import SendSvg from '@/components/svgIcon/SendSvg.vue'
import router, { RouterPath } from '@/router'
import { checkLoginStatus, Toast } from '@/utils'
import emitter from '@/utils/eventEmitter'
import { onUnmounted, ref, useTemplateRef } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
function navigateToLogin() {
  router.push(`${RouterPath.login}?redirect=${route.path}`)
}

const textarea = ref<string>('')
const sendComment = async (e: KeyboardEvent | MouseEvent) => {
  if (e instanceof KeyboardEvent) {
    if (e.key === 'Enter' && e.shiftKey) return
  }
  if (!textarea.value) {
    Toast.show({
      msg: '请输入内容',
      type: 'error',
    })
    return
  }

  if (!checkLoginStatus(navigateToLogin)) return
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
  emitter.emit('EVENT:UPDATE_POST_DETAIL')
  emitter.emit('EVENT:UPDATE_POST_LIST')
  textarea.value = ''
}

const textareaRef = useTemplateRef('textareaEl')
let off = emitter.on('EVENT:FOCUS_COMMENT_INPUT', () => {
  textareaRef.value?.focus()
})

onUnmounted(() => {
  off?.()
})
</script>

<template>
  <form @submit.prevent class="comment-input">
    <textarea
      v-disableEnter
      v-model.trim="textarea"
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
  box-shadow: 0 0 2px var(--theme-shadow-color);
  border-radius: calc($main-gap / 2);
  transition: all 0.3s ease;
  // overflow: hidden;

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
    font-family: 'Gill Sans';
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
