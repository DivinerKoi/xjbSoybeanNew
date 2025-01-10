<script setup>
import { computed, getCurrentInstance, inject, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { aesEncrypt } from './../utils/ase';
import { resetSize } from './../utils/util';
import { reqCheck, reqGet } from './../api/index';

// 定义 emit
const emit = defineEmits(['ready', 'success', 'error']);

// 注入父组件提供的方法和状态
const closeBox = inject('closeBox');
const clickShow = inject('clickShow', ref(false));

const props = defineProps({
  captchaType: {
    type: String
  },
  type: {
    type: String,
    default: '1'
  },
  mode: {
    type: String,
    default: 'fixed'
  },
  vSpace: {
    type: Number,
    default: 5
  },
  explain: {
    type: String,
    default: '向右滑动完成验证'
  },
  imgSize: {
    type: Object,
    default: () => ({
      width: '310px',
      height: '155px'
    })
  },
  blockSize: {
    type: Object,
    default: () => ({
      width: '50px',
      height: '50px'
    })
  },
  barSize: {
    type: Object,
    default: () => ({
      width: '310px',
      height: '40px'
    })
  }
});

const { proxy } = getCurrentInstance();
const secretKey = ref(''); // 后端返回的ase加密秘钥
const passFlag = ref(''); // 是否通过的标识
const backImgBase = ref(''); // 验证码背景图片
const blockBackImgBase = ref(''); // 验证滑块的背景图片
const backToken = ref(''); // 后端返回的唯一token值
const startMoveTime = ref('');
const endMovetime = ref('');
const tipWords = ref('');
const text = ref(props.explain);
const finishText = ref('');

const setSize = reactive({
  imgHeight: 0,
  imgWidth: 0,
  barHeight: 0,
  barWidth: 0
});

const top = ref(0);
const left = ref(0);
const moveBlockLeft = ref(undefined);
const leftBarWidth = ref(undefined);
// 移动中样式
const moveBlockBackgroundColor = ref(undefined);
const leftBarBorderColor = ref('#ddd');
const iconColor = ref(undefined);
const iconClass = ref('icon-right');
const status = ref(false); // 鼠标状态
const isEnd = ref(false); // 是够验证完成
const showRefresh = ref(true);
const transitionLeft = ref('');
const transitionWidth = ref('');
const startLeft = ref(0);

const barArea = computed(() => {
  return proxy.$el.querySelector('.verify-bar-area');
});

// 初始化函数
function init() {
  text.value = props.explain;
  getPictrue();
  nextTick().then(() => {
    const { imgHeight, imgWidth, barHeight, barWidth } = resetSize(proxy);
    setSize.imgHeight = imgHeight;
    setSize.imgWidth = imgWidth;
    setSize.barHeight = barHeight;
    setSize.barWidth = barWidth;
    // 修改为使用 emit
    emit('ready', proxy);
  });

  // 事件监听器改写为箭头函数
  window.removeEventListener('touchmove', e => move(e));
  window.removeEventListener('mousemove', e => move(e));
  window.removeEventListener('touchend', () => end());
  window.removeEventListener('mouseup', () => end());

  window.addEventListener('touchmove', e => move(e));
  window.addEventListener('mousemove', e => move(e));
  window.addEventListener('touchend', () => end());
  window.addEventListener('mouseup', () => end());
}

// 监听 type 变化
watch(
  () => props.type,
  () => {
    init();
  }
);

// 组件挂载时
onMounted(() => {
  init();
  proxy.$el.onselectstart = () => false;
});

// start, move, end 函数基本保持不变，但需要修改一些语法
function start(e) {
  const event = e || window.event;
  const xPos = event.touches ? event.touches[0].pageX : event.clientX;

  startLeft.value = Math.floor(xPos - barArea.value.getBoundingClientRect().left);
  startMoveTime.value = Number(new Date());

  if (isEnd.value === false) {
    text.value = '';
    moveBlockBackgroundColor.value = '#337ab7';
    leftBarBorderColor.value = '#337AB7';
    iconColor.value = '#fff';
    event.stopPropagation();
    status.value = true;
  }
}

// 鼠标移动
function move(e) {
  e ||= window.event;
  if (status.value && isEnd.value == false) {
    if (!e.touches) {
      // 兼容PC端
      var x = e.clientX;
    } else {
      // 兼容移动端
      var x = e.touches[0].pageX;
    }
    const bar_area_left = barArea.value.getBoundingClientRect().left;
    let move_block_left = x - bar_area_left; // 小方块相对于父元素的left值
    if (
      move_block_left >=
      barArea.value.offsetWidth - Number.parseInt(Number.parseInt(props.blockSize.width) / 2) - 2
    ) {
      move_block_left = barArea.value.offsetWidth - Number.parseInt(Number.parseInt(props.blockSize.width) / 2) - 2;
    }
    if (move_block_left <= 0) {
      move_block_left = Number.parseInt(Number.parseInt(props.blockSize.width) / 2);
    }
    // 拖动后小方块的left值
    moveBlockLeft.value = `${move_block_left - startLeft.value}px`;
    leftBarWidth.value = `${move_block_left - startLeft.value}px`;
  }
}

// 鼠标松开
function end() {
  endMovetime.value = Number(new Date());
  if (status.value && isEnd.value === false) {
    let moveLeftDistance = Number.parseInt((moveBlockLeft.value || '').replace('px', ''));
    moveLeftDistance = (moveLeftDistance * 310) / Number.parseInt(setSize.imgWidth);
    const data = {
      captchaType: props.captchaType,
      pointJson: secretKey.value
        ? aesEncrypt(JSON.stringify({ x: moveLeftDistance, y: 5.0 }), secretKey.value)
        : JSON.stringify({ x: moveLeftDistance, y: 5.0 }),
      token: backToken.value
    };

    reqCheck(data).then(res => {
      if (res.repCode === '0000') {
        moveBlockBackgroundColor.value = '#5cb85c';
        leftBarBorderColor.value = '#5cb85c';
        iconColor.value = '#fff';
        iconClass.value = 'icon-check';
        showRefresh.value = false;
        isEnd.value = true;

        if (props.mode === 'pop') {
          setTimeout(() => {
            clickShow.value = false;
            refresh();
          }, 1500);
        }

        passFlag.value = true;
        tipWords.value = `${((endMovetime.value - startMoveTime.value) / 1000).toFixed(2)}s验证成功`;

        const captchaVerification = secretKey.value
          ? aesEncrypt(`${backToken.value}---${JSON.stringify({ x: moveLeftDistance, y: 5.0 })}`, secretKey.value)
          : `${backToken.value}---${JSON.stringify({ x: moveLeftDistance, y: 5.0 })}`;

        setTimeout(() => {
          tipWords.value = '';
          closeBox?.();
          emit('success', { captchaVerification });
        }, 1000);
      } else {
        moveBlockBackgroundColor.value = '#d9534f';
        leftBarBorderColor.value = '#d9534f';
        iconColor.value = '#fff';
        iconClass.value = 'icon-close';
        passFlag.value = false;

        setTimeout(() => {
          refresh();
        }, 1000);

        emit('error', proxy);
        tipWords.value = '验证失败';
        setTimeout(() => {
          tipWords.value = '';
        }, 1000);
      }
    });
    status.value = false;
  }
}

// 刷新函数
const refresh = () => {
  showRefresh.value = true;
  finishText.value = '';
  transitionLeft.value = 'left .3s';
  moveBlockLeft.value = 0;
  leftBarWidth.value = undefined;
  transitionWidth.value = 'width .3s';
  leftBarBorderColor.value = '#ddd';
  moveBlockBackgroundColor.value = '#fff';
  iconColor.value = '#000';
  iconClass.value = 'icon-right';
  isEnd.value = false;

  getPictrue();
  setTimeout(() => {
    transitionWidth.value = '';
    transitionLeft.value = '';
    text.value = props.explain;
  }, 300);
};

// 获取图片函数
async function getPictrue() {
  const data = {
    captchaType: props.captchaType
  };

  try {
    const res = await reqGet(data);
    if (res.repCode === '0000') {
      backImgBase.value = res.repData.originalImageBase64;
      blockBackImgBase.value = res.repData.jigsawImageBase64;
      backToken.value = res.repData.token;
      secretKey.value = res.repData.secretKey;
    } else {
      tipWords.value = res.repMsg;
    }
  } catch (error) {
    console.error('获取验证码失败:', error);
  }
}
</script>

<template>
  <div style="position: relative">
    <div v-if="type === '2'" class="verify-img-out" :style="{ height: parseInt(setSize.imgHeight) + vSpace + 'px' }">
      <div class="verify-img-panel" :style="{ width: setSize.imgWidth, height: setSize.imgHeight }">
        <img :src="'data:image/png;base64,' + backImgBase" alt="" style="width: 100%; height: 100%; display: block" />
        <div v-show="showRefresh" class="verify-refresh" @click="refresh"><i class="iconfont icon-refresh"></i></div>
        <Transition name="tips">
          <span v-if="tipWords" class="verify-tips" :class="passFlag ? 'suc-bg' : 'err-bg'">{{ tipWords }}</span>
        </Transition>
      </div>
    </div>
    <div
      class="verify-bar-area"
      :style="{ width: setSize.imgWidth, height: barSize.height, 'line-height': barSize.height }"
    >
      <span class="verify-msg" v-text="text"></span>
      <div
        class="verify-left-bar"
        :style="{
          width: leftBarWidth !== undefined ? leftBarWidth : barSize.height,
          height: barSize.height,
          'border-color': leftBarBorderColor,
          transaction: transitionWidth
        }"
      >
        <span class="verify-msg" v-text="finishText"></span>
        <div
          class="verify-move-block"
          :style="{
            width: barSize.height,
            height: barSize.height,
            'background-color': moveBlockBackgroundColor,
            left: moveBlockLeft,
            transition: transitionLeft
          }"
          @touchstart="start"
          @mousedown="start"
        >
          <i class="iconfont verify-icon" :class="[iconClass]" :style="{ color: iconColor }"></i>
          <div
            v-if="type === '2'"
            class="verify-sub-block"
            :style="{
              width: Math.floor((parseInt(setSize.imgWidth) * 47) / 310) + 'px',
              height: setSize.imgHeight,
              top: '-' + (parseInt(setSize.imgHeight) + vSpace) + 'px',
              'background-size': setSize.imgWidth + ' ' + setSize.imgHeight
            }"
          >
            <img
              :src="'data:image/png;base64,' + blockBackImgBase"
              alt=""
              style="width: 100%; height: 100%; display: block"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
