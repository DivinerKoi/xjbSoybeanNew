// @unocss-include
// import { getRgb } from '@sa/color';
import { $t } from '@/locales';
// import { localStg } from '@/utils/storage';
// import systemLogo from '@/assets/svg-icon/logo.svg?raw';

export function setupLoading() {
  // 动态生成CSS样式
  const style = document.createElement('style');
  style.innerHTML = `
    .pl {
      width: 6em;
      height: 6em;
    }

    .pl__ring {
      animation: ringA 2s linear infinite;
    }

    .pl__ring--a {
      stroke: #f42f25;
    }

    .pl__ring--b {
      animation-name: ringB;
      stroke: #f49725;
    }

    .pl__ring--c {
      animation-name: ringC;
      stroke: #255ff4;
    }

    .pl__ring--d {
      animation-name: ringD;
      stroke: #f42582;
    }

    /* Animations */
    @keyframes ringA {
      from, 4% {
        stroke-dasharray: 0 660;
        stroke-width: 20;
        stroke-dashoffset: -330;
      }
      12% {
        stroke-dasharray: 60 600;
        stroke-width: 30;
        stroke-dashoffset: -335;
      }
      32% {
        stroke-dasharray: 60 600;
        stroke-width: 30;
        stroke-dashoffset: -595;
      }
      40%, 54% {
        stroke-dasharray: 0 660;
        stroke-width: 20;
        stroke-dashoffset: -660;
      }
      62% {
        stroke-dasharray: 60 600;
        stroke-width: 30;
        stroke-dashoffset: -665;
      }
      82% {
        stroke-dasharray: 60 600;
        stroke-width: 30;
        stroke-dashoffset: -925;
      }
      90%, to {
        stroke-dasharray: 0 660;
        stroke-width: 20;
        stroke-dashoffset: -990;
      }
    }

    @keyframes ringB {
      from, 12% {
        stroke-dasharray: 0 220;
        stroke-width: 20;
        stroke-dashoffset: -110;
      }
      20% {
        stroke-dasharray: 20 200;
        stroke-width: 30;
        stroke-dashoffset: -115;
      }
      40% {
        stroke-dasharray: 20 200;
        stroke-width: 30;
        stroke-dashoffset: -195;
      }
      48%, 62% {
        stroke-dasharray: 0 220;
        stroke-width: 20;
        stroke-dashoffset: -220;
      }
      70% {
        stroke-dasharray: 20 200;
        stroke-width: 30;
        stroke-dashoffset: -225;
      }
      90% {
        stroke-dasharray: 20 200;
        stroke-width: 30;
        stroke-dashoffset: -305;
      }
      98%, to {
        stroke-dasharray: 0 220;
        stroke-width: 20;
        stroke-dashoffset: -330;
      }
    }

    @keyframes ringC {
      from {
        stroke-dasharray: 0 440;
        stroke-width: 20;
        stroke-dashoffset: 0;
      }
      8% {
        stroke-dasharray: 40 400;
        stroke-width: 30;
        stroke-dashoffset: -5;
      }
      28% {
        stroke-dasharray: 40 400;
        stroke-width: 30;
        stroke-dashoffset: -175;
      }
      36%, 58% {
        stroke-dasharray: 0 440;
        stroke-width: 20;
        stroke-dashoffset: -220;
      }
      66% {
        stroke-dasharray: 40 400;
        stroke-width: 30;
        stroke-dashoffset: -225;
      }
      86% {
        stroke-dasharray: 40 400;
        stroke-width: 30;
        stroke-dashoffset: -395;
      }
      94%, to {
        stroke-dasharray: 0 440;
        stroke-width: 20;
        stroke-dashoffset: -440;
      }
    }

    @keyframes ringD {
      from, 8% {
        stroke-dasharray: 0 440;
        stroke-width: 20;
        stroke-dashoffset: 0;
      }
      16% {
        stroke-dasharray: 40 400;
        stroke-width: 30;
        stroke-dashoffset: -5;
      }
      36% {
        stroke-dasharray: 40 400;
        stroke-width: 30;
        stroke-dashoffset: -175;
      }
      44%, 50% {
        stroke-dasharray: 0 440;
        stroke-width: 20;
        stroke-dashoffset: -220;
      }
      58% {
        stroke-dasharray: 40 400;
        stroke-width: 30;
        stroke-dashoffset: -225;
      }
      78% {
        stroke-dasharray: 40 400;
        stroke-width: 30;
        stroke-dashoffset: -395;
      }
      86%, to {
        stroke-dasharray: 0 440;
        stroke-width: 20;
        stroke-dashoffset: -440;
      }
    }
  `;

  // 将样式添加到 <head> 中
  document.head.appendChild(style);

  // 加载动画HTML结构
  const loadingHTML = `
    <div class="fixed-center flex-col bg-[#e8e8e8]">
      <svg class="pl" width="240" height="240" viewBox="0 0 240 240">
        <circle class="pl__ring pl__ring--a" cx="120" cy="120" r="105" fill="none" stroke="#000" stroke-width="20" stroke-dasharray="0 660" stroke-dashoffset="-330" stroke-linecap="round"></circle>
        <circle class="pl__ring pl__ring--b" cx="120" cy="120" r="35" fill="none" stroke="#000" stroke-width="20" stroke-dasharray="0 220" stroke-dashoffset="-110" stroke-linecap="round"></circle>
        <circle class="pl__ring pl__ring--c" cx="85" cy="120" r="70" fill="none" stroke="#000" stroke-width="20" stroke-dasharray="0 440" stroke-linecap="round"></circle>
        <circle class="pl__ring pl__ring--d" cx="155" cy="120" r="70" fill="none" stroke="#000" stroke-width="20" stroke-dasharray="0 440" stroke-linecap="round"></circle>
      </svg>
      <h2 class="text-28px font-500 text-#646464">${$t('system.title')}</h2>
    </div>
  `;

  // 获取 app 容器并插入加载动画
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = loadingHTML;
  }
}

// export function setupLoading() {
//   const themeColor = localStg.get('themeColor') || '#646cff';
//
//   const { r, g, b } = getRgb(themeColor);
//
//   const primaryColor = `--primary-color: ${r} ${g} ${b}`;
//
//   const loadingClasses = [
//     'left-0 top-0',
//     'left-0 bottom-0 animate-delay-500',
//     'right-0 top-0 animate-delay-1000',
//     'right-0 bottom-0 animate-delay-1500'
//   ];
//
//   const logoWithClass = systemLogo.replace('<svg', `<svg class="size-128px text-primary"`);
//
//   const dot = loadingClasses
//     .map(item => {
//       return `<div class="absolute w-16px h-16px bg-primary rounded-8px animate-pulse ${item}"></div>`;
//     })
//     .join('\n');
//
//   const loading = `
// <div class="fixed-center flex-col" style="${primaryColor}">
//   ${logoWithClass}
//   <div class="w-56px h-56px my-36px">
//     <div class="relative h-full animate-spin">
//       ${dot}
//     </div>
//   </div>
//   <h2 class="text-28px font-500 text-#646464">${$t('system.title')}</h2>
// </div>`;
//
//   const app = document.getElementById('app');
//
//   if (app) {
//     app.innerHTML = loading;
//   }
// }
