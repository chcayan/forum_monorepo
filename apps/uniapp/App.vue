<script setup lang="ts">
import { navigateInterceptor } from './utils'
import emitter from './utils/eventEmitter'
import { useStatusStore, useUserStore } from '@/stores/index'
import { onLaunch } from '@dcloudio/uni-app'
import { watch } from 'vue'

const statusStore = useStatusStore()
const userStore = useUserStore()

async function initUserStatus() {
  await userStore.getUserInfo()
  await userStore.getUserCollectListOfPostId()
  await userStore.getUserFollowList()
  await userStore.getUserFriendList()
}

watch(
  () => userStore.token,
  async () => {
    if (!userStore.token) return
    await initUserStatus()
  }
)

onLaunch(async () => {
  statusStore.initTheme()
  navigateInterceptor()

  emitter.on('API:UN_AUTH', (message: string) => {
    console.log(message)
    uni.showToast({
      icon: 'none',
      title: message,
    })
    userStore.removeToken()
  })

  emitter.on('API:BAD_REQUEST', (message: string) => {
    uni.showToast({
      icon: 'none',
      title: message,
    })
  })

  if (userStore.token) {
    await initUserStatus()
  }
})
</script>

<style></style>
