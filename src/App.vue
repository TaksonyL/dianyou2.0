<script lang="ts">
import Vue from 'vue';
const bt = require('@/utils/bluetooth');
import { AB2Hex } from '@/utils/util';
import { updateBattery, offLine } from '@/api/user';
import { CommonModule } from '@/store/modules/common';
import { BluetoothModule } from '@/store/modules/bluetooth';
// import getBT from '@/utils/getBT';

export default Vue.extend({
  mpType: 'app',
  methods: {
    // 搜索设备
    async findDev() {
      bt.findBT();
      return
      let searchData = await bt.searchBT(BluetoothModule.localName);
      // 定义设备基本参数
      BluetoothModule.SET_BLUETOOTH({
        deviceId: searchData.deviceId,
        deviceInfo: AB2Hex(searchData.advertisData)
      })

      // connectDev();
      bt.remindPage('connect'); 
    },
  },
  onLaunch() {
    let that = this

    // uni.hideTabBar({
    //   animation: false,
    // })

    // 获取导航高度
    uni.getSystemInfo({
      success(res) {
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

    // 开启蓝牙设备状态监听
    uni.onBluetoothAdapterStateChange(async (res) => {
      console.log(res, BluetoothModule.launch, '监听蓝牙状态')
      if(res.available !== BluetoothModule.launch) {
        if(res.available) {
          // 监听到蓝牙打开

          if(!BluetoothModule.init) {
            // 如果蓝牙未启动
            await bt.initBT()
            BluetoothModule.SET_BLUETOOTH({init:true})
          }
          BluetoothModule.SET_BLUETOOTH({launch:true})
          that.findDev();
          console.log('蓝牙开启');
        } else {
          // 监听到蓝牙关闭
          // BluetoothModule.SET_BLUETOOTH({launch:false})
          BluetoothModule.SET_LAUNCH(false)
          console.log('蓝牙关闭', BluetoothModule.launch);
          // 回调当前页面
          bt.remindPage('close');
        }  
      }
    })

    

    // 连接蓝牙
    bt.initBT().then(async (res:any) => {
      BluetoothModule.SET_BLUETOOTH({
        launch: true,
        init: true
      })

      this.findDev();
    }).catch((err:any) => {
      BluetoothModule.SET_BLUETOOTH({
        init: false
      })
    })
  },
  onShow() {
    
  },
  onHide() {
    CommonModule.SET_UNLOAD(true);
    if(!CommonModule.payTime) {
      // 断开连接
      if(BluetoothModule.battery > 0) {
        updateBattery({battery: BluetoothModule.battery});
      }
      if(CommonModule.machineId && CommonModule.connect) {
        offLine({id: CommonModule.machineId})
        CommonModule.SET_CONNECT(false)
      }
      bt.closeBT(BluetoothModule.deviceId).catch((err:any) => {
        console.log(err)
      });
    }
  }
});
</script>

<style lang="scss">
/*每个页面公共css */
  @import "uview-ui/index.scss";

  .container {
    display: block;
  }

  page{
    background-color: #f5f5f5;
    font-size: 28rpx;
    color: #333333;
  }
  .font-red{ color: #e64240; }
  .font-gray{ color: #808080 }
  .back-red{ background-color: #e64240;color: #fff; }
  .back-blue{ background-color: #1485ee;color: #fff; }
  .back-gray{ background-color: #808080;color: #fff }

  .formItem{
    line-height: 100rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }


  image{
    width: 100%;
    height: 100%;
  }

  .longtext{
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
  }
  .p30{
    padding: 0 30rpx;
  }

  // 全局图片防止初始加载拉长
  image{will-change: transform}
</style>
