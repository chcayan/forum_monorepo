<script setup lang="ts">
import { createCommentReportAPI } from '@/api'
import { Toast } from '@/utils'
import { ref } from 'vue'

const { isOpen, commentId } = defineProps<{
  isOpen: boolean
  commentId: number
}>()

const emit = defineEmits(['closeReportModal'])

const reason = ref('')
const closeModal = () => {
  emit('closeReportModal')
}

const submitReport = async () => {
  if (!reason.value.trim()) {
    Toast.show({ msg: '内容不为空', type: 'error' })
    return
  }
  await createCommentReportAPI({ commentId, reason: reason.value })
  Toast.show({
    msg: '提交成功，等待审核中',
    type: 'success',
  })
  reason.value = ''
  closeModal()
}
</script>

<template>
  <div class="modal" v-if="isOpen">
    <p>请填写举报原因:</p>
    <textarea v-model="reason"></textarea>
    <div class="btn">
      <button class="submit" @click="submitReport">提交</button>
      <button class="cancel" @click="closeModal">取消</button>
    </div>
  </div>
  <div class="shade" v-if="isOpen"></div>
</template>

<style scoped lang="scss">
.modal {
  width: 210px;
  height: 145px;
  background-color: var(--theme-color);
  // box-shadow: var(--theme-shadow-color);
  border-radius: 10px;
  padding: 15px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  z-index: $modal-shade-z-index + 1;

  .btn {
    display: flex;
    align-items: center;
    justify-content: space-around;

    button {
      width: 60px;
      height: 30px;
      border-radius: 10px;
      font-size: 13px;
      color: var(--theme-font-color);
    }

    .submit {
      background-color: var(--theme-send-button-color);
    }
  }
  p {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 10px;
  }

  textarea {
    margin: 0 0 5px;
    outline: none;
    border: none;
    width: 100%;
    height: 50px;
    resize: none;
    padding: 10px;
    border-radius: 10px;
    color: var(--theme-font-color);
    background-color: var(--theme-textarea-bg-color);
    font-family: system-ui;

    &::-webkit-scrollbar {
      width: 10px;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 10px;
      background-color: var(--theme-scrollbar-thumb-color);
    }
  }
}

.shade {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.489);
  z-index: $modal-shade-z-index;
}
</style>
