import { CommonModule } from '@/store/modules/common';

interface respond {
  state: number,
  msg: string,
  data: any
}

/**
 * 请求封装
 * @param {String} api    // 接口地址
 * @param {Any} data      // 请求数据
 * @param {Boolean} loading     // 是否需要加载动画
 * @param {GET | POST} method 
 */
 export default function request(api:string, data:any, loading:boolean = false, method:'GET'|'POST' = 'GET'):Promise<respond>{
  const url = 'https://cd.cdwkwh.com/miniprogram';
  if(loading) {
    uni.showLoading({
      title: '加载中...',
    })
  }

  let header = {'content-type': 'application/json'};
  // @ts-ignore
  if(CommonModule.session) header['Cookie'] = CommonModule.session;

  return new Promise((resolve, rejects) => {
    uni.request({
      url: url + api,
      method,
      data,
      timeout: 10000,
      header,
      success(res:any) {
        if(loading) {
          uni.hideLoading();
        }
        if(res.header['Set-Cookie']) {
          CommonModule.SET_SESSION(res.header['Set-Cookie'])
        }

        if(res.statusCode !== 200) {
          uni.showToast({
            title: '网络错误',
            icon: 'none'
          })
          console.log(res, api)
          rejects(res);
          return 
        }


        // 成功返回
        if(res.data.code === 200 || res.data.code === 205 || res.data.state === 200) {
          resolve(res.data);
        } else {
           // 拦截
          if(api === '/machine/updateBattery' || api === '/machine/getAdvList') return rejects(res);
          uni.showToast({
            title: res.data.msg,
            icon: 'none'
          })
          rejects(res);
          return 
        }

      },
      fail(err) {
        if(loading) {
          uni.hideLoading();
        }
        console.log(err);
        rejects(err);
      }
    })
  })
}