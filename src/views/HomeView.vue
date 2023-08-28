<template>
  <div v-if="isShow" class="ai-elf-box">
    <div class="dialogue">
      <div class="top-bg">
        <span>MR.Lava</span>
        <img class="close" :src="closeImg" alt="" @click.native="isShow = !isShow" />
      </div>
      <div class="content">
        <div class="main" ref="chatContent">
          <div class="scroll_item" v-for="item in dataList" :key="item.id">
            <div class="question">
              <p @click.native="copy(item.question)">
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
                  @click.native="handleStatus(item, 1)"
                  class="zan"
                  :src="item.good ? yellowImg : zanImg"
                  alt=""
                />
                <img
                  @click.native="handleStatus(item, 0)"
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
        <p class="send" @click.native="handleSearch">Send</p>
        <!--    <img
          class="send"
          :src="sendImg"
          alt=""
          @click.native="handleSearch"
          loading="lazy"
        /> -->
        <p v-if="!isShowInput" @click.native="handleInput(true)">
          Please enter the content
        </p>
        <textarea
          v-else
          rows="3"
          v-model="textarea"
          ref="refInput"
          class="textarea"
          maxlength="500"
          @keyup.enter="handleSearch"
        ></textarea>
      </div>
    </div>

    <div class="loading" v-if="loading">
      <span>loading...</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, nextTick } from 'vue';
import axios from 'axios';
import closeImg from '@/assets/close.png';
import userImg from '@/assets/user.png';
import zanImg from '@/assets/zan.png';
import redImg from '@/assets/zan-red.png';
import avatar from '@/assets/avatar.png';
import yellowImg from '@/assets/zan-yellow.png';
import sendImg from '@/assets/send.png';
const uuId = uuidFn(36);
// console.log('uuId', uuId);

const refInput = ref();
const loading = ref(false);
const chatContent = ref(); //滚动容器
const BASE_URL = import.meta.env.__API_BASE_URL__;
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
  if (val) {
    nextTick(() => {
      refInput.value.focus();
    });
  }
}

function scrollToBottom() {
  nextTick(() => {
    chatContent.value.scrollTop =
      chatContent.value.scrollHeight - chatContent.value.offsetHeight;
  });
}

function handleSearch() {
  const val = textarea.value;
  if (!val) {
    nextTick(() => {
      refInput.value.focus();
    });
    return;
  }

  handleInput(false);
  dataList.value.push({
    id: dataList.value.length,
    good: false,
    bad: false,

    answer: 'Inquiring...',
    question: val,
  });
  loading.value = true;
  axios({
    method: 'post',
    url: BASE_URL + '/aiSlots/askQuestion',
    data: {
      question: textarea.value,
      sessionId: uuId,
    },
  })
    .then((response: any) => {
      if (response.data.code == 200) {
        dataList.value.splice(dataList.value.length - 1, 1, {
          id: dataList.value.length,
          good: false,
          bad: false,
          answer: response.data.data,
          question: val,
        });
      } else {
        console.log('error:' + response.data.message);
        dataList.value.splice(dataList.value.length - 1, 1, {
          id: dataList.value.length,
          good: false,
          bad: false,
          answer: 'Query failed!',
          question: val,
        });
        // setTimeout(() => {
        //   dataList.value.pop();
        // }, 3000);
      }
      scrollToBottom();
      loading.value = false;
      textarea.value = '';
    })
    .catch((error) => {
      scrollToBottom();
      loading.value = false;
      textarea.value = '';
    });
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
    url: BASE_URL + '/aiSlots/submit',
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

/**
 * @description 生成uuid, 该函数已扩展至Mtils对象中
 * @param {int} [len]   可选,生成uuid的长度,默认36位,建议20位以上
 * @param {int} [radix]   可选,生成的进制基数，8是8进制,10是10进制等等
 * @returns {String}, 生成的UUID
 **/
function uuidFn(len?: number, radix?: number) {
  var uuid, chars, i, r, uuid;
  chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  uuid = [];
  i = void 0;
  radix = radix || chars.length;
  if (len) {
    i = 0;
    while (i < len) {
      uuid[i] = chars[0 | (Math.random() * radix)];
      i++;
    }
  } else {
    r = void 0;
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
    uuid[14] = '4';
    i = 0;
    while (i < 36) {
      if (!uuid[i]) {
        r = 0 | (Math.random() * 16);
        uuid[i] = chars[i === 19 ? (r & 0x3) | 0x8 : r];
      }
      i++;
    }
  }
  return uuid.join('');
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
    height: 327px;
    background: url('../assets/bg.png') repeat;
    // background: url(var(--bgImg)) repeat;
    background-size: 100% 100%;
  }
  .top-bg {
    width: 100%;
    height: 41px;
    padding-top: 5px;
    box-sizing: border-box;
    background: url('../assets/top-bg.png') repeat;
    background-size: 100% 100%;

    text-align: center;
    span {
      font-size: 14px;
      font-family: PingFang SC-Bold, PingFang SC;
      font-weight: bold;
      letter-spacing: 1px;
      color: transparent;
      -webkit-text-stroke: 0.5px #150834;
      text-stroke: 0.5px #150834;
      -webkit-text-fill-color: #ffffff;
      text-fill-color: #ffffff;
    }
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
    height: 57px;
    line-height: 57px;
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
    .send {
      z-index: 10;
      position: absolute;
      background: url('../assets/send.png') repeat;
      background-size: 100% 100%;
      top: 8px;
      right: 8px;
      cursor: pointer;
      width: 74px;
      height: 41px;
      line-height: 41px;
      font-size: 12px;
      font-family: PingFang SC-Bold, PingFang SC;
      font-weight: bold;
      color: #ffffff;
      letter-spacing: 2px;
    }
    .textarea {
      position: absolute;
      z-index: 9;
      display: inline-block;
      width: 85%;
      max-height: 56px;
      padding: 6px;
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
  .main::-webkit-scrollbar,
  .textarea::-webkit-scrollbar {
    display: none;
  }
  .main {
    width: 80%;
    height: 230px;
    box-sizing: border-box;
    padding: 0 12px;
    padding-bottom: 65px;
    overflow-y: auto;
  }

  .question {
    display: flex;
    justify-content: end;
    align-items: center;
    cursor: default;
    padding: 12px 24px;
    p {
      text-align: left;
      word-wrap: break-word;
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
      margin-left: 8px;
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

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    line-height: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.75);
    color: #ffffff;
    font-size: 12px;
  }
}
</style>
