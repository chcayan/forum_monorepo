<script setup lang="ts">
import { createPostReportAPI } from '@/api'
import { Toast } from '@/utils'
import { ref } from 'vue'

const { isOpen, postId } = defineProps<{
  isOpen: boolean
  postId: string
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
  await createPostReportAPI({ postId, reason: reason.value })
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
  width: 200px;
  height: 135px;
  background-color: var(--theme-color);
  border-radius: 10px;
  padding: 10px;
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
    resize: none;
    outline: none;
    width: 180px;
    height: 50px;
    font-family:
      system-ui,
      -apple-system;
    border-radius: 5px;
    padding: 5px;
    margin-bottom: 5px;
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
