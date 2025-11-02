import { getUserCollectPostIdListAPI } from '@/api'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useUserStore } from './user'

export const usePostStore = defineStore('post', () => {
  const userStore = useUserStore()

  const userCollectListOfPostId = ref<string[]>([])

  const getUserCollectListOfPostId = async () => {
    const res = await getUserCollectPostIdListAPI({
      creatorUserId: userStore.userInfo?.user_id as string,
    })
    if (!res.data?.data) return
    userCollectListOfPostId.value = res.data.data.map(
      (item: { p_id: string }) => item.p_id
    )
    // console.log(userCollectListOfPostId.value)
  }

  return {
    userCollectListOfPostId,
    getUserCollectListOfPostId,
  }
})
