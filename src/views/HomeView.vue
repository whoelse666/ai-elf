<template>
  <div v-if="isShow" class="ai-elf-box">
    <div class="dialogue">
      <div class="top-bg">
        <span>AI-管家</span>
        <img class="close" :src="closeImg" alt="" @click="isShow = !isShow" />
      </div>
      <div class="content">
        <div class="main">
          <div v-for="item in dataList" :key="item.id">
            <div class="question">
              <p @click="copy(item.question)">
                {{ item.question }}
              </p>
            </div>
            <div class="answer">
              <img class="user" :src="avatar" alt="" />
              <div class="text">
                {{ item.answer }}
              </div>
              <div class="zan-box">
                <img
                  @click="handleStatus(item, 1)"
                  class="zan"
                  :src="item.good ? yellowImg : zanImg"
                  alt=""
                />
                <img
                  @click="handleStatus(item, 0)"
                  class="zan"
                  :class="{ rotation: !item.bad }"
                  :src="item.bad ? redImg : zanImg"
                  alt=""
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="input-box">
        <img class="user-avatar" :src="userImg" alt="" />
        <p v-if="!isShowInput" @click.stop="handleInput(true)">请您输入内容</p>
        <textarea
          v-else
          rows="3"
          v-model="textarea"
          class="textarea"
          @keyup.enter.native="handleSearch"
        ></textarea>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import closeImg from '@/assets/close.png';
import userImg from '@/assets/user.png';
import zanImg from '@/assets/zan.png';
import redImg from '@/assets/zan-red.png';
import avatar from '@/assets/avatar.png';

import yellowImg from '@/assets/zan-yellow.png';

const textarea = ref<string>('');
const isShow = ref<boolean>(true);
const isShowInput = ref<boolean>(false);
const dataList = ref<any>([
  // {
  //   id: '1',
  //   good: false,
  //   bad: false,
  //   avatar: '../assets/avatar.png',
  //   answer:
  //     '你好，我是IFUN-AI助手。请问有什么可以帮助你的吗？你可以直接发消息来跟我对话哦。',
  //   question: 'IFUN的slots游戏有什么特点？',
  // },
]);

function getAssetUrl(img: string) {
  return new URL(img, import.meta.url).href;
}
function handleInput(val: boolean) {
  isShowInput.value = val;
}

function handleSearch() {
  handleInput(false);
  const val = textarea.value;

  dataList.value.push({
    id: dataList.value.length,
    good: false,
    bad: false,

    answer: '查询中...',
    question: val,
  });
  axios({
    method: 'post',
    url: '/api/aiSlots/askQuestion',
    data: {
      question: textarea.value,
    },
  }).then((response: any) => {
    dataList.value.pop();
    dataList.value.push({
      id: dataList.value.length,
      good: false,
      bad: false,

      answer: response.data.data,
      question: val,
    });
  });

  textarea.value = '';
}

function copy(content: string) {
  console.log('已复制');
  /*   navigator &&
    navigator.clipboard &&
    navigator.clipboard
      .writeText(content)
      .then(() => {
        console.log('复制成功！');
      })
      .catch((err) => {
        console.log('复制失败！');
      }); */
  const input = document.createElement('input');
  input.value = content;
  document.body.appendChild(input);
  input.select();
  document.execCommand('Copy');
  input.remove();
}

interface ObjType {
  id: number;
  good: boolean;
  bad: boolean;
  avatar?: string;
  answer: string;
  question: string;
}

// 1:点赞 0：踩
function handleStatus(item: ObjType, isLike: number) {
  const type = isLike == 1 ? 'good' : 'bad';
  axios({
    method: 'post',
    url: '/api/aiSlots/submit',
    data: {
      question: item.question,
      answer: item.answer,
      isLike,
    },
  }).then((response: any) => {
    if (response.data.code == 200) {
      item[type] = !item[type];
    }
  });
}
</script>

<style lang="scss">
.ai-elf-box {
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.75);
  border-radius: 0px 0px 0px 0px;
  position: relative;
  overflow: hidden;
  .dialogue {
    position: absolute;
    left: 50%;
    top: 24px;
    transform: translateX(-50%);
    width: 627px;
    min-height: 327px;
    background: url('../assets/bg.png') repeat;
    // background: url(var(--bgImg)) repeat;
    background-size: 100% 100%;
  }
  .top-bg {
    width: 100%;
    height: 82px;
    padding-top: 10px;
    box-sizing: border-box;
    background: url('../assets/top-bg.png') repeat;
    background-size: 100% 100%;
    font-size: 28px;
    font-weight: bold;
    color: #ffffff;
    text-align: center;
  }
  .close {
    position: absolute;
    top: 0;
    right: 0;
    width: 39px;
    height: 26px;
    cursor: pointer;
  }

  .input-box {
    $padding: 12px;
    position: absolute;
    box-sizing: border-box;
    bottom: $padding;
    left: $padding;
    right: $padding;
    width: calc(100% - 24px);
    height: 56px;
    line-height: 56px;
    background: url('../assets/input-bg.png') repeat;
    background-size: 100% 100%;
    P {
      cursor: pointer;
      text-align: center;
      font-size: 12px;
      font-weight: bold;
      color: #000000;
    }
    .user-avatar {
      position: absolute;
      top: -18px;
      width: 13px;
      height: 13px;
    }
    .textarea {
      position: absolute;
      z-index: 9;
      display: inline-block;
      width: 100%;
      max-height: 56px;
      padding: 12px;
      box-sizing: border-box;
      border: none !important;
      border-radius: 5px;
      background-color: transparent;
      resize: none;
    }
    textarea:focus {
      outline: none;
    }
  }

  .main {
    width: 80%;
    height: 327px;
    box-sizing: border-box;
    padding: 12px;
    margin-bottom: 60px;
    overflow-y: auto;
  }
  ::-webkit-scrollbar {
    /*隐藏滚轮*/
    display: none;
  }

  //question
  .question {
    display: flex;
    justify-content: end;
    align-items: center;
    cursor: default;
    p {
      max-width: 304px;
      height: auto;
      padding: 12px 24px;
      box-sizing: border-box;
      background: url('../assets/question.png') repeat;
      background-size: 100% 100%;
      font-size: 12px;
      font-weight: bold;
      color: #ffffff;

      margin: 12px 0;
    }
  }
  .answer {
    display: flex;
    justify-content: start;
    align-items: center;
    .user {
      width: 54px;
      height: 35px;
    }
    .text {
      max-width: 304px;
      height: auto;
      padding: 12px 24px;
      box-sizing: border-box;
      background: url('../assets/answer.png') repeat;
      background-size: 100% 100%;

      font-size: 12px;
      font-weight: bold;
      color: #000000;
    }
  }
  .zan-box {
    display: flex;
    flex-direction: column;
    .zan {
      margin: 2px 0;
      width: 21px;
      height: 21px;
      cursor: pointer;
    }

    .zan.rotation {
      transform: rotate(180deg);
    }
  }
}
</style>
