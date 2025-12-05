<script setup lang="ts">
import { navigateInterceptor } from './utils'
import { useStatusStore } from '@/stores/index'
import { onLaunch } from '@dcloudio/uni-app'

const statusStore = useStatusStore()

onLaunch(() => {
  statusStore.initTheme()
  navigateInterceptor()
})
</script>

<style></style>
