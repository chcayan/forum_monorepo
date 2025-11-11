import { getUserCollectPostIdListAPI, getUserInfoAPI } from '@/api'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useUserStore } from './user'
import { UserInfo } from '@forum-monorepo/types'

export const usePostStore = defineStore('post', () => {
  const userStore = useUserStore()

  const userCollectListOfPostId = ref<string[]>([])

  const getUserCollectListOfPostId = async () => {
    const res = await getUserCollectPostIdListAPI({
      creatorUserId: userStore.userInfo?.user_id as string,
    })
    const arr = res.data?.data ?? []
    userCollectListOfPostId.value = arr.map(
      (item: { p_id: string }) => item.p_id
    )
  }

  const userInfo = ref<UserInfo>({
    user_id: '',
    username: '',
    user_avatar: '',
    user_email: '',
    registration: '',
    follows: 0,
    fans: 0,
    background_img: '',
    sex: '',
    signature: '',
  })

  const getUserInfo = async (userId: string) => {
    userInfo.value = {
      user_id: '',
      username: '',
      user_avatar: '',
      user_email: '',
      registration: '',
      follows: 0,
      fans: 0,
      background_img: '',
      sex: '',
      signature: '',
    }
    const res = await getUserInfoAPI({
      userId,
    })
    userInfo.value = res.data.data[0]
  }

  return {
    userCollectListOfPostId,
    getUserCollectListOfPostId,
    userInfo,
    getUserInfo,
  }
})
