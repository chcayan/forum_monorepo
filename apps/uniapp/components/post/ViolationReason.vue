<script setup lang="ts">
import { getViolationReasonAPI } from '@/api'
import { ref } from 'vue'

const { postId } = defineProps<{
  postId: string
}>()

const reason = ref('')

const getViolationReason = async () => {
  const res = await getViolationReasonAPI(postId)
  reason.value = res.data.data.reason
}

getViolationReason()
</script>

<template>
  <view class="reason">违规原因：{{ reason }}</view>
</template>

<style scoped lang="scss">
.reason {
  border-radius: 5px;
  padding: 3px 5px;
  font-size: 13px;
  border: 2px solid rgb(243, 130, 130);
  background-color: rgba(243, 130, 130, 0.295);
  margin-bottom: 10px;
}
</style>
