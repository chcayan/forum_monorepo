<script setup lang="ts">
import { getUserMessageAPI } from '@/api'
import { UserMessage } from '@forum-monorepo/types'

const getUserMessage = async () => {
  const res = await getUserMessageAPI()
  const data: UserMessage[] = res.data.data
  console.log(data)
}

getUserMessage()
</script>

<template>
  <div class="message">
    <p>审核通过</p>
    <h2>您的帖子已发布</h2>
    <p>恭喜！您发布的关于。。。。已通过审核</p>
    <div>原文。。。</div>
  </div>
</template>

<style scoped lang="scss"></style>
