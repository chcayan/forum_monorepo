<script setup lang="ts">
import { onMounted, ref } from 'vue'

const active = ref('')
const parseImages = ref<Array<string>>([])
const { images } = defineProps<{
  images: string
}>()

parseImages.value = JSON.parse(images)
console.log(images)

onMounted(() => {
  active.value = `size${parseImages.value.length}`
})
</script>

<template>
  <div class="box" :class="active">
    <img v-for="image in parseImages" :key="image" :src="image" />
  </div>
</template>

<style scoped lang="scss">
.box {
  width: 100%;
  height: 100%;

  img {
    display: block;
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    max-width: 380px;
    max-height: 380px;
    aspect-ratio: 1;
    object-fit: cover;
    cursor: pointer;
    border-radius: $gap * 0.5;
  }
}

@for $i from 1 through 9 {
  .size#{$i} {
    display: grid;
    gap: calc($gap / 2);
  }
}

.size1 {
  grid-template-columns: 1fr;
}

.size2,
.size4 {
  grid-template-columns: repeat(2, 1fr);
}

.size5 {
  grid-template-areas:
    'a b c'
    'a d e';
  grid-template-rows: repeat(2, 1fr);
  grid-template-columns: repeat(3, 1fr);

  img:nth-child(1) {
    grid-area: a;
  }
}

.size7 {
  grid-template-areas:
    'a b c'
    'a d e'
    'f g g';
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);

  img:nth-child(1) {
    grid-area: a;
  }

  img:nth-child(7) {
    grid-area: g;
  }
}

.size8 {
  grid-template-columns: repeat(4, 1fr);
}

.size3,
.size6,
.size9 {
  grid-template-columns: repeat(3, 1fr);
}
</style>
