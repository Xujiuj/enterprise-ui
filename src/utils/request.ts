import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { useUserStore } from '@/store/modules/user';
import { getToken } from '@/utils/auth';
import { tansParams, blobValidate } from '@/utils/ruoyi';
import cache from '@/plugins/cache';
import { HttpStatus } from '@/enums/RespEnum';
import { errorCode } from '@/utils/errorCode';
import { LoadingInstance } from 'element-plus/es/components/loading/src/loading';
import FileSaver from 'file-saver';
import { getLanguage } from '@/lang';
import { encryptBase64, encryptWithAes, generateAesKey, decryptWithAes, decryptBase64 } from '@/utils/crypto';
import { encrypt, decrypt } from '@/utils/jsencrypt';
import router from '@/router';

const encryptHeader = 'encrypt-key';
let downloadLoadingInstance: LoadingInstance;
export const isRelogin = { show: false };

export const globalHeaders = () => {
  return {
    Authorization: 'Bearer ' + getToken(),
    clientid: import.meta.env.VITE_APP_CLIENT_ID
  };
};

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8';
axios.defaults.headers['clientid'] = import.meta.env.VITE_APP_CLIENT_ID;

const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 50000,
  transitional: {
    clarifyTimeoutError: true
  }
});

service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.headers['Content-Language'] = getLanguage();

    const isToken = config.headers?.isToken === false;
    const isRepeatSubmit = config.headers?.repeatSubmit === false;
    const isEncrypt = config.headers?.isEncrypt === 'true';

    if (getToken() && !isToken) {
      config.headers['Authorization'] = 'Bearer ' + getToken();
    }
    if (config.method === 'get' && config.params) {
      let url = config.url + '?' + tansParams(config.params);
      url = url.slice(0, -1);
      config.params = {};
      config.url = url;
    }

    if (!isRepeatSubmit && (config.method === 'post' || config.method === 'put')) {
      const requestObj = {
        url: config.url,
        data: typeof config.data === 'object' ? JSON.stringify(config.data) : config.data,
        time: new Date().getTime()
      };
      const sessionObj = cache.session.getJSON('sessionObj');
      if (sessionObj === undefined || sessionObj === null || sessionObj === '') {
        cache.session.setJSON('sessionObj', requestObj);
      } else {
        const s_url = sessionObj.url;
        const s_data = sessionObj.data;
        const s_time = sessionObj.time;
        const interval = 500;
        if (s_data === requestObj.data && requestObj.time - s_time < interval && s_url === requestObj.url) {
          const message = '数据正在处理，请勿重复提交';
          console.warn(`[${s_url}]: ` + message);
          return Promise.reject(new Error(message));
        } else {
          cache.session.setJSON('sessionObj', requestObj);
        }
      }
    }
    if (import.meta.env.VITE_APP_ENCRYPT === 'true' && isEncrypt && (config.method === 'post' || config.method === 'put')) {
      const aesKey = generateAesKey();
      config.headers[encryptHeader] = encrypt(encryptBase64(aesKey));
      config.data = typeof config.data === 'object' ? encryptWithAes(JSON.stringify(config.data), aesKey) : encryptWithAes(config.data, aesKey);
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

service.interceptors.response.use(
  (res: AxiosResponse) => {
    if (import.meta.env.VITE_APP_ENCRYPT === 'true') {
      const keyStr = res.headers[encryptHeader];
      if (keyStr != null && keyStr != '') {
        const data = res.data;
        const base64Str = decrypt(keyStr);
        const aesKey = decryptBase64(base64Str.toString());
        const decryptData = decryptWithAes(data, aesKey);
        res.data = JSON.parse(decryptData);
      }
    }
    const code = res.data.code || HttpStatus.SUCCESS;
    const msg = errorCode[code] || res.data.msg || errorCode['default'];
    if (res.request.responseType === 'blob' || res.request.responseType === 'arraybuffer') {
      return res.data;
    }
    if (code === HttpStatus.UNAUTHORIZED) {
      if (!isRelogin.show) {
        isRelogin.show = true;
        ElMessageBox.confirm('登录状态已过期，您可以继续留在当前页面，或重新登录', '系统提示', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            isRelogin.show = false;
            useUserStore()
              .logout()
              .then(() => {
                router.replace({
                  path: '/login',
                  query: {
                    redirect: encodeURIComponent(router.currentRoute.value.fullPath || '/')
                  }
                });
              });
          })
          .catch(() => {
            isRelogin.show = false;
          });
      }
      return Promise.reject('无效会话或会话已过期，请重新登录');
    } else if (code === HttpStatus.FORBIDDEN) {
      ElMessage({ message: msg, type: 'error', duration: 5 * 1000 });
      return Promise.reject(new Error(msg));
    } else if (code === HttpStatus.SERVER_ERROR) {
      ElMessage({ message: msg, type: 'error' });
      return Promise.reject(new Error(msg));
    } else if (code === HttpStatus.WARN) {
      ElMessage({ message: msg, type: 'warning' });
      return Promise.reject(new Error(msg));
    } else if (code !== HttpStatus.SUCCESS) {
      ElNotification.error({ title: msg });
      return Promise.reject(new Error(msg));
    } else {
      return Promise.resolve(res.data);
    }
  },
  (error: any) => {
    let { message } = error;
    const status = error.response?.status;
    const responseMsg = error.response?.data?.msg;
    if (responseMsg) {
      message = responseMsg;
    } else if (status === HttpStatus.UNAUTHORIZED) {
      message = errorCode['401'];
    } else if (status === HttpStatus.FORBIDDEN) {
      message = errorCode['403'];
    } else if (status === HttpStatus.NOT_FOUND) {
      message = errorCode['404'];
    } else if (message === 'Network Error') {
      message = '后端服务连接异常，请检查服务是否启动';
    } else if (message.includes('timeout')) {
      message = '系统接口请求超时，请稍后重试';
    } else if (message.includes('Request failed with status code')) {
      message = '系统接口 ' + message.substr(message.length - 3) + ' 异常';
    }
    ElMessage({ message: message, type: 'error', duration: 5 * 1000 });
    return Promise.reject(error);
  }
);

export function download(url: string, params: any, fileName: string) {
  downloadLoadingInstance = ElLoading.service({ text: '正在下载数据，请稍候', background: 'rgba(0, 0, 0, 0.7)' });
  return service
    .post(url, params, {
      transformRequest: [
        (params: any) => {
          return tansParams(params);
        }
      ],
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      responseType: 'blob'
    })
    .then(async (resp: any) => {
      const isLogin = blobValidate(resp);
      if (isLogin) {
        const blob = new Blob([resp]);
        FileSaver.saveAs(blob, fileName);
      } else {
        const blob = new Blob([resp]);
        const resText = await blob.text();
        const rspObj = JSON.parse(resText);
        const errMsg = errorCode[rspObj.code] || rspObj.msg || errorCode['default'];
        ElMessage.error(errMsg);
      }
      downloadLoadingInstance.close();
    })
    .catch((r: any) => {
      console.error(r);
      ElMessage.error('下载文件出现错误，请联系管理员');
      downloadLoadingInstance.close();
    });
}

export default service;
