<script lang="ts">
  import { CommonModule } from '@/store/modules/common';
  import { offLine } from '@/api/user';

  import Vue from 'vue';
  export default Vue.extend({
      mpType: 'app',
      data() {
        return {
          isFirst: true,      // 是否首次启动
        }
      },
      onLaunch(options) {
        console.log('启动参数', options)
        console.log('App Launch')
        uni.hideTabBar({
          animation: false,
        })

        // 获取导航高度
        uni.getSystemInfo({
          success(res:any) {
            CommonModule.SET_NAVHEIGHT(res.statusBarHeight * (750 / res.windowWidth) + 97)
          },fail(err) {}
        })

        const updateManager = uni.getUpdateManager();

        updateManager.onCheckForUpdate(function (res) {
          // 请求完新版本信息的回调
          let hasUpdate = res.hasUpdate
          if(hasUpdate) {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function (res) {
                if (res.confirm) {
                  // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate()
                }
              }
            })
          }
        })

        updateManager.onUpdateReady(function () {
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用？',
            success: function (res) {
              if (res.confirm) {
                // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                updateManager.applyUpdate()
              }
            }
          })
        });

        updateManager.onUpdateFailed(function () {
          wx.showToast({
            title: "新版本更新失败",
            icon: 'none'
          })
        })

      },
      onShow() {
        let pages = getCurrentPages();
        let page = pages[pages.length - 1];
        if(page) {
          console.log('App Show', page, this.isFirst)
          let route = page.route
          if(route !== 'pages/index/index' && CommonModule.bt && !CommonModule.bt.status.connect && !CommonModule.bt.status.find) {
            console.log('后台切换重连');
            CommonModule.bt.reconnect();
          }
        }
        // if(this.isFirst) {
        //   this.isFirst = false;
        // } else {
        //   if(CommonModule.bt && !CommonModule.bt.status.connect && !CommonModule.bt.status.find) {
        //     console.log('后台切换重连');
        //     CommonModule.bt.reconnect();
        //   }
        // }
      },
      onHide() {
        console.log('App Hide')
        if(!CommonModule.payTime) {
          CommonModule.bt.close().then((res:any) => {
            offLine({ id: CommonModule.machineId })
          }).catch((err:any) => console.log(err))  
        }
      }
  });
</script>

<style lang="scss">
  @import "uview-ui/index.scss";
    /*每个页面公共css */

  page{
    background-color: #f2f2f2;
    font-size: 28rpx;
  }

  .p30{
    padding: 0 30rpx;
  }
  
  .block-between{
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
  }

  .font-color-price{
    color: #d7000f;
  }

  .btn-color-main{
    background-color: $main-color;
    color: #fafafa;
    border-radius: 8rpx;
  }
  .btn-color-primary{
    background-color: #1485ee;
    color: #fafafa;
    border-radius: 8rpx;
  }
  .btn-color-ban{
    background-color: #808080;
    color: #fafafa;
    border-radius: 8rpx;
  }

  image{
    width: 100%;
    height: 100%;
  }

  // 缺省
  .emptyWrap{
    width: 100%;
    text-align: center;
    color: #808080;
    padding-top: 100rpx;
    image{
      width: 300rpx;
      height: 300rpx;
      margin-bottom: 20rpx;
    }
  }
</style>
