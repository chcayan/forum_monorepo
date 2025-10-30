<script setup lang="ts">
import { ref } from 'vue'
import ImgUpload from './components/ImgUpload.vue'

const context = ref<string>()
</script>

<template>
  <form class="publish-view" @submit.prevent>
    <article>
      <header>
        <h1>new Post()</h1>
        <p>发布你的绝世旷作</p>
      </header>
      <div class="main">
        <h3>内容：</h3>
        <textarea
          v-model.trim="context"
          name="context"
          placeholder="请输入内容..."
        ></textarea>
        <h3>图片：</h3>
        <ImgUpload />
      </div>
    </article>
  </form>
</template>

<style scoped lang="scss">
.publish-view {
  article {
    width: 400px;
    padding: 10px;
    box-shadow: 0 0 2px var(--theme-shadow-color);
    border-radius: 10px;

    header {
      p {
        opacity: 0.7;
      }
    }

    .main {
      margin-top: 20px;

      textarea {
        margin: 10px 0;
        outline: none;
        border: none;
        width: 380px;
        height: 300px;
        resize: none;
        padding: 10px;
        border-radius: 10px;
        color: var(--theme-font-color);
        background-color: var(--theme-textarea-bg-color);

        &::-webkit-scrollbar {
          width: 10px;
        }

        &::-webkit-scrollbar-thumb {
          border-radius: 10px;
          background-color: var(--theme-scrollbar-thumb-color);
        }
      }
    }
  }
}
</style>
