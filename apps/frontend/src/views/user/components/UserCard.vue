<script setup lang="ts">
import { updateUserInfoAPI } from '@/api'
import CloseSvg from '@/components/svgIcon/CloseSvg.vue'
import EditSvg from '@/components/svgIcon/EditSvg.vue'
import SavaSvg from '@/components/svgIcon/SavaSvg.vue'
import { RouterPath } from '@/router'
import { useUserStore } from '@/stores'
import { Toast } from '@/utils'
import FollowButton from '@/views/post/components/FollowButton.vue'
import type { UserInfo } from '@forum-monorepo/types'
import { nextTick, ref, useTemplateRef } from 'vue'
import { useRoute } from 'vue-router'

const { userInfo } = defineProps<{
  userInfo: UserInfo
}>()

const userStore = useUserStore()

const name = ref(userInfo.username || '')
const signature = ref(userInfo.signature || '')

const nameRef = useTemplateRef('nameEL')
const signatureRef = useTemplateRef('signatureEl')
const bgRef = useTemplateRef('bgEl')
const avatarRef = useTemplateRef('avatarEl')
const bgInputRef = useTemplateRef('bgInputEl')
const avatarInputRef = useTemplateRef('avatarInputEl')
const oldBgSrc = ref<string>('')
const oldAvatarSrc = ref<string>('')

const fieldsMap = {
  name,
  signature,
}

function handleInput(field: keyof typeof fieldsMap, text: string) {
  fieldsMap[field].value = text
}

const isContenteditable = ref(false)

const route = useRoute()
const edit = async () => {
  if (!route.path.startsWith(RouterPath.my)) return
  isContenteditable.value = true
  await nextTick()

  if (bgInputRef.value) {
    bgInputRef.value.addEventListener('change', handleBgChange)
  }

  if (avatarInputRef.value) {
    avatarInputRef.value.addEventListener('change', handleAvatarChange)
  }
}

let flag = true
const save = async () => {
  if (
    name.value === userInfo.username &&
    signature.value === userInfo.signature &&
    !bgInputRef.value?.files?.[0] &&
    !avatarInputRef.value?.files?.[0]
  ) {
    Toast.show({
      msg: '什么都没更新呢',
      type: 'error',
    })
    return
  }
  if (!name.value) {
    Toast.show({
      msg: '名字不能为空',
      type: 'error',
    })
    return
  }

  if (!flag) return
  flag = false
  await updateUserInfoAPI({
    username: name.value.trim() || userInfo.username,
    sex: userInfo.sex,
    signature: signature.value.trim() || userInfo.signature,
    avatar: avatarInputRef.value?.files?.[0] || null,
    bgImg: bgInputRef.value?.files?.[0] || null,
  }).catch()
  await userStore.getUserInfo().catch().catch()
  Toast.show({
    msg: '更新成功',
    type: 'success',
  })
  close(false)
  flag = true
}

const close = (isOldImgRecovery: boolean) => {
  isContenteditable.value = false
  if (nameRef.value?.innerText || nameRef.value?.innerText === '') {
    nameRef.value.innerText = userInfo.username
  }
  if (signatureRef.value?.innerText || signatureRef.value?.innerText === '') {
    signatureRef.value.innerText = userInfo.signature
  }
  if (oldBgSrc.value && bgRef.value && isOldImgRecovery) {
    bgRef.value.src = oldBgSrc.value
    oldBgSrc.value = ''
  }
  if (oldAvatarSrc.value && avatarRef.value && isOldImgRecovery) {
    avatarRef.value.src = oldAvatarSrc.value
    oldAvatarSrc.value = ''
  }
  if (bgInputRef.value) {
    bgInputRef.value.removeEventListener('change', handleBgChange)
  }
  if (avatarInputRef.value) {
    avatarInputRef.value.removeEventListener('change', handleAvatarChange)
  }
}

function handleBgChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    Toast.show({
      msg: '请不要上传奇奇怪怪的东西😑',
      type: 'error',
    })
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    const newSrc = reader.result as string

    if (!oldBgSrc.value && bgRef.value?.src) {
      oldBgSrc.value = bgRef.value.src
    }

    if (bgRef.value) {
      bgRef.value.src = newSrc
    }
  }
  reader.readAsDataURL(file)
}

function handleAvatarChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    Toast.show({
      msg: '请不要上传奇奇怪怪的东西😑',
      type: 'error',
    })
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    const newSrc = reader.result as string

    if (!oldAvatarSrc.value && avatarRef.value?.src) {
      oldAvatarSrc.value = avatarRef.value.src
    }

    if (avatarRef.value) {
      avatarRef.value.src = newSrc
    }
  }
  reader.readAsDataURL(file)
}
</script>

<template>
  <div class="user-card">
    <div class="header">
      <label>
        <img
          v-loading
          class="bg"
          :class="{ 'edit-img': isContenteditable }"
          :src="userInfo.background_img"
          ref="bgEl"
          alt="bg"
          @dblclick="edit"
        />
        <input
          ref="bgInputEl"
          v-if="isContenteditable"
          type="file"
          accept="image/*"
          style="display: none"
        />
      </label>
      <label>
        <img
          v-loading
          class="avatar"
          :class="{ 'edit-img': isContenteditable }"
          :src="userInfo.user_avatar"
          ref="avatarEl"
          alt="avatar"
          @dblclick="edit"
        />
        <input
          ref="avatarInputEl"
          v-if="isContenteditable"
          type="file"
          accept="image/*"
          style="display: none"
        />
      </label>
      <div v-if="userInfo.user_id === userStore.userInfo?.user_id" class="btn">
        <EditSvg
          tabindex="0"
          class="tab-focus-style"
          v-if="!isContenteditable"
          @click="edit"
          @keydown.enter="edit"
        />
        <div v-else>
          <SavaSvg
            tabindex="0"
            class="tab-focus-style"
            @click="save"
            @keydown.enter="save"
          />
          <CloseSvg
            tabindex="0"
            class="tab-focus-style"
            @click="close(true)"
            @keydown.enter="close"
          />
        </div>
      </div>
      <div class="follow-btn" v-else>
        <FollowButton class="f-btn" />
      </div>
    </div>
    <div class="main">
      <span
        ref="nameEL"
        :contenteditable="isContenteditable"
        class="name"
        :class="{ edit: isContenteditable }"
        v-editable-limit="{
          max: 16,
          onInput: (text: string) => handleInput('name', text),
        }"
        @dblclick="edit"
        >{{ userInfo.username }}</span
      >
      <span class="id">{{ userInfo.user_id }}</span>
      <div class="main-item">
        <div class="follows">
          <span class="text">0 关注</span>
        </div>
        <span>&nbsp;&nbsp;&nbsp;</span>
        <div class="fans">
          <span class="text">0 粉丝</span>
        </div>
      </div>
      <div
        ref="signatureEl"
        class="desc"
        :class="{ edit: isContenteditable }"
        :contenteditable="isContenteditable"
        v-editable-limit="{
          max: 30,
          onInput: (text: string) => handleInput('signature', text),
        }"
        @dblclick="edit"
      >
        {{ userInfo.signature }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
$main-gap: 20px;
$position-size: 200px;
.user-card {
  display: flex;
  flex-direction: column;
  width: 100%;

  .edit {
    text-decoration: underline;

    &:focus {
      outline: none;
    }
  }

  .edit-img {
    border: 4px solid var(--theme-button-hover-color) !important;
    transition: all 0.1s ease;
    cursor: pointer;
  }

  .header {
    position: relative;
    height: $position-size;

    .follow-btn {
      display: flex;

      .f-btn {
        margin-left: auto;
        margin-top: 10px;
      }
    }

    .bg {
      width: 100%;
      height: $position-size - 60px;
      object-fit: cover;
      border-radius: calc($main-gap / 2);
      border: 3px solid black;
      user-select: none;
    }

    .avatar {
      position: absolute;
      top: $position-size - 100px;
      left: $main-gap;
      width: 80px;
      height: 80px;
      aspect-ratio: 1;
      object-fit: cover;
      border-radius: 50%;
      border: 3px solid black;
      user-select: none;
    }

    .btn {
      position: absolute;
      top: $position-size - 50px;
      right: 10px;
      width: 80px;
      height: 30px;
      display: flex;
      justify-content: end;
      cursor: pointer;

      div {
        display: flex;
        justify-content: end;
        gap: 10px;
      }
    }
  }

  .main {
    height: 100px;
    margin-left: $main-gap;

    .main-item {
      display: flex;
      margin-top: 5px;

      .text {
        opacity: 0.6;
      }
    }

    .desc {
      display: -webkit-box;
      line-clamp: 1;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: 5px;
      font-size: 14px;
      opacity: 0.8;
    }

    .name {
      font-weight: bold;
      font-size: 20px;
      padding-right: 10px;
    }

    .id {
      opacity: 0.6;
      font-size: 14px;
    }
  }
}
</style>
