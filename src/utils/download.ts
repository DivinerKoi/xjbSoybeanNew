// import { request } from '@/service/request';
// import { saveAs } from 'file-saver';
//
// interface DownloadConfig extends Partial<App.Service.RequestConfig> {
//   responseType?: 'blob';
// }
//
// /**
//  * 验证是否为blob格式
//  * @param data
//  */
// export function blobValidate(data: any) {
//   return data.type !== 'application/json';
// }
//
// /**
//  * 转换请求参数
//  * @param params
//  */
// function tansParams(params: Record<string, any>) {
//   let result = '';
//   for (const key in params) {
//     if (params[key] !== null && params[key] !== undefined) {
//       if (typeof params[key] === 'object') {
//         result += `${encodeURIComponent(key)}=${encodeURIComponent(JSON.stringify(params[key]))}&`;
//       } else {
//         result += `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}&`;
//       }
//     }
//   }
//   return result.slice(0, -1);
// }
//
// /**
//  * 通用下载Excel方法
//  * @param url - 请求地址
//  * @param params - 请求参数
//  * @param filename - 文件名
//  * @param config - 额外配置
//  */
// export async function downloadExcel(
//   url: string,
//   params: Record<string, any>,
//   filename: string,
//   config?: DownloadConfig
// ) {
//   const loadingKey = 'downloading';
//   try {
//     window.$loadingBar?.start();
//     window.$message?.loading('正在下载数据，请稍候...', { key: loadingKey, duration: 0 });
//
//     const { data } = await request.post(url, params, {
//       transformRequest: [(params) => tansParams(params)],
//       headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//       responseType: 'blob',
//       ...config
//     });
//
//     const isBlob = blobValidate(data);
//     if (isBlob) {
//       const blob = new Blob([data]);
//       saveAs(blob, filename);
//       window.$message?.success('下载成功', { key: loadingKey });
//     } else {
//       const resText = await data.text();
//       const rspObj = JSON.parse(resText);
//       const errMsg = rspObj.msg || '下载失败';
//       window.$message?.error(errMsg, { key: loadingKey });
//     }
//   } catch (error) {
//     console.error('下载文件出现错误:', error);
//     window.$message?.error('下载文件出现错误，请联系管理员！', { key: loadingKey });
//   } finally {
//     window.$loadingBar?.finish();
//   }
// }
