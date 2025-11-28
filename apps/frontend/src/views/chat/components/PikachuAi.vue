<script setup lang="ts">
import { getAiChatResultAPI } from '@/api'
import { AiChatInfo } from '@forum-monorepo/types'
import { onMounted, ref, useTemplateRef } from 'vue'

const container = useTemplateRef('pickContainer')
const body = useTemplateRef('body')
const thunderDiv = useTemplateRef('thunder')
const bubble = useTemplateRef('bubble')
const input = useTemplateRef('userInput')
const sendBtn = useTemplateRef('sendBtn')
const context = ref('')

onMounted(() => {
  if (container.value) {
    // --- Manual Interaction (Click to Shock) ---
    container.value.addEventListener('click', () => {
      if (input.value && input.value.matches(':focus')) return
      // Don't shock if typing
      triggerShock()
    })
  }

  if (sendBtn.value && input.value) {
    // Event Listeners
    sendBtn.value.addEventListener('click', sendMessage)
    input.value.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage()
    })
  }
})

let timer: number | undefined
function triggerShock() {
  resetMoods()
  if (container.value && body.value && bubble.value && sendBtn.value) {
    container.value.classList.add('shock')
    body.value.parentElement!.style.backgroundColor = '#333'
    sendBtn.value.style.background = '#333'
    bubble.value.textContent = 'CHUUUU!!!'
    bubble.value.classList.add('show')
  }
  createLightning()

  if (timer) clearTimeout(timer)
  if (timer1) clearInterval(timer1)
  timer = setTimeout(() => {
    if (
      container.value &&
      body.value &&
      bubble.value &&
      thunderDiv.value &&
      sendBtn.value
    ) {
      container.value.classList.remove('shock')
      body.value.parentElement!.style.backgroundColor = '#87CEEB'
      sendBtn.value.style.background = '#87CEEB'
      thunderDiv.value.innerHTML = ''
      bubble.value.classList.remove('show')
    }
  }, 1500)
}

function createLightning() {
  for (let i = 0; i < 10; i++) {
    const bolt = document.createElement('div')
    bolt.className = 'bolt'
    bolt.style.left = 50 + (Math.random() * 100 - 50) + '%'
    bolt.style.top = 50 + (Math.random() * 100 - 50) + '%'
    bolt.style.transform = `rotate(${Math.random() * 360}deg)`
    if (thunderDiv.value) {
      thunderDiv.value.appendChild(bolt)
    }
  }
}

// Helper to reset CSS mood classes
function resetMoods() {
  if (container.value && body.value && sendBtn.value) {
    container.value.classList.remove(
      'happy',
      'angry',
      'shocked',
      'sad',
      'shock'
    )
    body.value.parentElement!.style.backgroundColor = '#87CEEB'
    sendBtn.value.style.background = '#87CEEB'
  }
}

// Send Message Logic
let text: string
let timer1: number | undefined
async function sendMessage() {
  if (input.value && sendBtn.value && bubble.value) {
    if (!context.value) {
      text = ''
      triggerShock()
      return
    }

    // UI Updates
    text = context.value
    context.value = ''
    input.value.disabled = true
    sendBtn.value.disabled = true

    bubble.value.textContent = 'Thinking'
    bubble.value.classList.add('typing-dots')
    bubble.value.classList.add('show')
  }

  // resetMoods()

  try {
    const prompt = `
      你是皮卡丘。用户说：“${text}”。
      使用下面格式回复（不要用json)：
      1. "message"：你的回复文本。主要使用"皮卡"、"皮卡丘"、"皮"等音效，但需括号内附上翻译。保持简短可爱。
      2. "mood"：可选值包括["happy", "angry", "shocked", "sad", "neutral", "attack"]。
      示例：message: 皮卡皮卡！（你好，朋友！), mode: happy
    `

    const res = await getAiChatResultAPI({ prompt })

    const data: AiChatInfo = res.data.data
    const rawText = data.message.content
    const msgIndex = rawText.indexOf('message')
    const moodIndex = rawText.indexOf('mood')

    const message = rawText.slice(msgIndex + 8, moodIndex - 2).trim()
    const mood = rawText.slice(moodIndex)

    if (bubble.value) {
      // Apply logic based on Gemini result
      bubble.value.classList.remove('typing-dots')
      bubble.value.textContent = message
    }

    applyMood(mood)
  } catch (error) {
    console.error(error)
    if (bubble.value) {
      bubble.value.textContent = 'Pika...? (Error)'
      bubble.value.classList.remove('typing-dots')
    }
  } finally {
    if (input.value && sendBtn.value) {
      input.value.disabled = false
      sendBtn.value.disabled = false
      input.value.focus()
    }

    // Hide bubble after a few seconds
    if (timer) clearTimeout(timer)
    if (timer1) clearTimeout(timer1)
    timer1 = setTimeout(() => {
      if (
        bubble.value &&
        container.value &&
        !container.value.classList.contains('shock')
      ) {
        // Only hide if not currently shocking
        bubble.value.classList.remove('show')
      }
    }, 5000)
  }
}

function applyMood(mood: string) {
  resetMoods()
  const m = mood.toLowerCase()

  if (container.value && body.value && sendBtn.value) {
    if (m.includes('happy')) {
      container.value.classList.add('happy')
      body.value.parentElement!.style.backgroundColor = '#FFFACD' // Light yellow bg
      sendBtn.value.style.background = '#FFFACD'
    } else if (m.includes('angry')) {
      container.value.classList.add('angry')
      body.value.parentElement!.style.backgroundColor = '#FFB6C1' // Light red bg
      sendBtn.value.style.background = '#FFB6C1'
    } else if (m.includes('shock')) {
      container.value.classList.add('shocked')
      body.value.parentElement!.style.backgroundColor = '#E0FFFF' // Light cyan
      sendBtn.value.style.background = '#E0FFFF'
    } else if (m.includes('sad')) {
      container.value.classList.add('sad')
      body.value.parentElement!.style.backgroundColor = '#D3D3D3' // Grey
      sendBtn.value.style.background = '#D3D3D3'
    } else if (m.includes('attack')) {
      triggerShock()
    }
  }
  // Neutral does nothing (default state)
}
</script>

<template>
  <div class="pikachu" ref="body">
    <div class="main-wrapper">
      <div class="container" id="pikaContainer" ref="pickContainer">
        <!-- Dynamic Bubble -->
        <div class="speech-bubble" id="bubble" ref="bubble">Pika?</div>

        <div class="thunder-shock" id="thunder" ref="thunder"></div>

        <div class="pikachu" id="pikachuArt">
          <div class="ear left"></div>
          <div class="ear right"></div>
          <div class="head">
            <div class="eye left"></div>
            <div class="eye right"></div>
            <div class="cheek left"></div>
            <div class="cheek right"></div>
            <div class="nose"></div>
            <div class="mouth"></div>
          </div>
          <div class="body"></div>
          <div class="arm left"></div>
          <div class="arm right"></div>
          <div class="foot left"></div>
          <div class="foot right"></div>
          <div class="tail">
            <div class="tail-part t1"></div>
            <div class="tail-part t2"></div>
            <div class="tail-part t3"></div>
          </div>
        </div>
        <div class="shadow"></div>
      </div>
    </div>
  </div>

  <div class="chat-interface">
    <input
      type="text"
      id="userInput"
      ref="userInput"
      v-model="context"
      placeholder="Chat with Pikachu..."
      autocomplete="off"
    />
    <button id="sendBtn" title="发送" ref="sendBtn">➤</button>
  </div>
</template>

<style scoped lang="scss">
$pika-yellow: #f6bd20;
$pika-dark: #d4a017;
$cheek-red: #e94f37;
$bg-color: #87ceeb;
$input-bg: rgba(255, 255, 255, 0.9);

.pikachu > * {
  -webkit-tap-highlight-color: transparent !important;
  color: black;
}

.main-wrapper {
  position: relative;
  flex-grow: 1;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.container {
  position: relative;
  width: 300px;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

/* --- UI Elements --- */
.chat-interface {
  position: fixed;
  bottom: 30px;
  width: 90%;
  max-width: 300px;
  display: flex;
  gap: 10px;
  z-index: 100;
  background: $input-bg;
  padding: 10px;
  border-radius: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transform: translateY(150%); /* Hidden initially */
  animation: slideUp 0.5s 0.5s forwards;
}

@keyframes slideUp {
  to {
    transform: translateY(0);
  }
}

input#userInput {
  width: 10px;
  flex-grow: 1;
  border: none;
  background: transparent;
  padding: 10px 15px;
  font-size: 16px;
  outline: none;
}

button#sendBtn {
  background: $bg-color;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition: 0.2s;
  font-size: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
}

button#sendBtn:hover {
  transform: scale(1.1);
  background: $bg-color;
}

button#sendBtn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 对话框 - Now Dynamic */
.speech-bubble {
  position: absolute;
  top: -100px; /* Higher to fit text */
  background: white;
  padding: 15px 20px;
  border-radius: 20px;
  font-weight: bold;
  opacity: 0;
  transform: translateY(10px);
  transition: 0.3s;
  pointer-events: none;
  min-width: 120px;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  max-width: 250px;
  line-height: 1.4;
  font-size: 14px;
  z-index: 20;
}

.speech-bubble.show {
  opacity: 1;
  transform: translateY(0);
}

.speech-bubble::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  border-width: 10px 10px 0;
  border-style: solid;
  border-color: white transparent;
  transform: translateX(-50%);
}

/* Loading Dots */
.typing-dots::after {
  content: ' .';
  animation: dots 1.5s steps(5, end) infinite;
}
@keyframes dots {
  0%,
  20% {
    content: ' .';
  }
  40% {
    content: ' ..';
  }
  60% {
    content: ' ...';
  }
  80%,
  100% {
    content: '';
  }
}

/* --- PIKACHU CSS (Base) --- */
.pikachu {
  position: relative;
  animation: bounce 2s infinite ease-in-out;
  z-index: 10;
  transition: transform 0.3s;
}

.head {
  width: 160px;
  height: 150px;
  background-color: $pika-yellow !important;
  border-radius: 45% 45% 40% 40%;
  position: relative;
  z-index: 5;
  box-shadow: inset -10px -5px 0 rgba(0, 0, 0, 0.05);
}

.ear {
  position: absolute;
  width: 40px;
  height: 100px;
  background-color: $pika-yellow;
  border-radius: 50% 50% 0 0;
  top: -60px;
  overflow: hidden;
  transform-origin: bottom center;
  z-index: 1;
  transition: transform 0.5s;
}
.ear.left {
  left: 0;
  transform: rotate(-35deg);
  animation: ear-wiggle-left 3s infinite ease-in-out;
}
.ear.right {
  right: 0;
  transform: rotate(35deg);
  animation: ear-wiggle-right 3.2s infinite ease-in-out;
}
.ear::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 35%;
  background-color: #333;
  transform: skewY(10deg);
}
.ear.right::after {
  transform: skewY(-10deg);
}

.eye {
  position: absolute;
  top: 55px;
  width: 22px;
  height: 22px;
  background-color: #222;
  border-radius: 50%;
  animation: blink 4s infinite;
  transition:
    height 0.2s,
    border-radius 0.2s;
}
.eye.left {
  left: 35px;
}
.eye.right {
  right: 35px;
}
.eye::after {
  content: '';
  position: absolute;
  top: 4px;
  left: 4px;
  width: 8px;
  height: 8px;
  background-color: white;
  border-radius: 50%;
}

.cheek {
  position: absolute;
  top: 85px;
  width: 35px;
  height: 35px;
  background-color: $cheek-red;
  border-radius: 50%;
  opacity: 0.8;
  transition: transform 0.2s;
}
.cheek.left {
  left: 10px;
}
.cheek.right {
  right: 10px;
}

.nose {
  position: absolute;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 3px;
  background-color: #333;
  border-radius: 50%;
}

.mouth {
  position: absolute;
  top: 90px;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 15px;
  transition:
    height 0.2s,
    border-radius 0.2s,
    top 0.2s;
}
.mouth::before,
.mouth::after {
  content: '';
  position: absolute;
  bottom: 0;
  width: 15px;
  height: 8px;
  border-bottom: 2px solid #333;
  border-radius: 0 0 15px 15px;
  transition: transform 0.2s;
}
.mouth::before {
  left: -1px;
  border-right: 1px solid transparent;
}
.mouth::after {
  right: -1px;
  border-left: 1px solid transparent;
}

.body {
  position: absolute;
  bottom: -60px;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 90px;
  background-color: $pika-yellow;
  border-radius: 40% 40% 40% 40%;
  z-index: 4;
}

.arm {
  position: absolute;
  top: 90px;
  width: 30px;
  height: 50px;
  background-color: $pika-yellow;
  border-radius: 20px;
  z-index: 6;
  transition: transform 0.3s;
}
.arm.left {
  left: 30px;
  transform: rotate(30deg);
}
.arm.right {
  right: 30px;
  transform: rotate(-30deg);
}

.foot {
  position: absolute;
  bottom: -70px;
  width: 40px;
  height: 20px;
  background-color: $pika-yellow;
  border-radius: 20px;
  z-index: 4;
}
.foot.left {
  left: 30px;
  transform: rotate(-10deg);
}
.foot.right {
  right: 30px;
  transform: rotate(10deg);
}

.tail {
  position: absolute;
  top: 20px;
  right: -60px;
  width: 80px;
  height: 120px;
  z-index: 2;
  transform-origin: bottom left;
  animation: tail-wag 2s infinite ease-in-out;
}
.tail-part {
  position: absolute;
  background-color: $pika-yellow;
}
.t1 {
  bottom: 0;
  left: 0;
  width: 20px;
  height: 40px;
  background-color: #8b4513;
  transform: rotate(-20deg);
}
.t2 {
  bottom: 30px;
  left: 10px;
  width: 30px;
  height: 50px;
  transform: rotate(60deg);
}
.t3 {
  bottom: 50px;
  left: 30px;
  width: 40px;
  height: 60px;
  transform: rotate(-10deg);
  border-radius: 5px;
}

.shadow {
  position: absolute;
  bottom: -80px;
  width: 120px;
  height: 20px;
  background-color: rgba(0, 0, 0, 0.15);
  border-radius: 50%;
  animation: shadow-scale 2s infinite ease-in-out;
  z-index: 0;
}

.thunder-shock {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  opacity: 0;
}
.bolt {
  position: absolute;
  width: 4px;
  height: 40px;
  background: yellow;
  box-shadow: 0 0 10px yellow;
  transform-origin: center;
}

/* --- ANIMATION KEYFRAMES --- */
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}
@keyframes shadow-scale {
  0%,
  100% {
    scale: 1;
    opacity: 0.15;
  }
  50% {
    scale: 0.8;
    opacity: 0.1;
  }
}
@keyframes blink {
  0%,
  90%,
  100% {
    scale: 1 1;
  }
  95% {
    scale: 1 0.1;
  }
}
@keyframes ear-wiggle-left {
  0%,
  100% {
    transform: rotate(-35deg);
  }
  50% {
    transform: rotate(-45deg);
  }
}
@keyframes ear-wiggle-right {
  0%,
  100% {
    transform: rotate(35deg);
  }
  50% {
    transform: rotate(25deg);
  }
}
@keyframes tail-wag {
  0%,
  100% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(10deg);
  }
}

/* --- MOOD STATES (Driven by Gemini) --- */

/* HAPPY */
.container.happy .pikachu {
  animation: happy-bounce 0.8s infinite ease-in-out;
}
.container.happy .cheek {
  transform: scale(1.2);
}
.container.happy .mouth {
  height: 20px;
  border-radius: 0 0 20px 20px;
  background: #900;
  border: none;
  top: 92px;
}
.container.happy .mouth::before,
.container.happy .mouth::after {
  border: none;
  background: transparent;
} /* hide normal mouth lines */
@keyframes happy-bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-25px);
  }
}

/* ANGRY */
.container.angry .head {
  background-color: #f8c8c8;
} /* Slightly reddish face */
.container.angry .eye {
  clip-path: polygon(0 0, 100% 20%, 100% 100%, 0% 100%);
} /* Angry eyes */
.container.angry .cheek {
  box-shadow: 0 0 10px red;
  animation: flash-cheeks 0.2s infinite;
}
.container.angry .pikachu {
  animation: shake-angry 0.1s infinite;
}
@keyframes shake-angry {
  0% {
    transform: translate(1px, 0);
  }
  100% {
    transform: translate(-1px, 0);
  }
}

/* SHOCKED */
.container.shocked .mouth {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #333;
  border: none;
}
.container.shocked .mouth::before,
.container.shocked .mouth::after {
  display: none;
}
.container.shocked .eye {
  transform: scale(1.2);
}
.container.shocked .pikachu {
  transform: scale(0.9);
  animation: none;
} /* Frozen */

/* SAD */
.container.sad .ear.left {
  transform: rotate(-70deg);
  animation: none;
}
.container.sad .ear.right {
  transform: rotate(70deg);
  animation: none;
}
.container.sad .mouth {
  top: 95px;
  transform: rotate(180deg) scale(0.8);
}
.container.sad .pikachu {
  animation: slow-bounce 4s infinite;
}
@keyframes slow-bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

/* ACTIVE/SHOCK (Original Click) */
.container.shock .cheek {
  box-shadow: 0 0 20px 5px var(--neon-pink, red);
  background-color: #ff0000;
  animation: flash-cheeks 0.2s infinite;
}
.container.shock .pikachu {
  animation: shake 0.1s infinite;
}
@keyframes flash-cheeks {
  0%,
  100% {
    box-shadow: 0 0 10px red;
  }
  50% {
    box-shadow: 0 0 30px yellow;
  }
}
@keyframes shake {
  0% {
    transform: translate(1px, 1px);
  }
  50% {
    transform: translate(-1px, -2px);
  }
  100% {
    transform: translate(1px, -1px);
  }
}
</style>
