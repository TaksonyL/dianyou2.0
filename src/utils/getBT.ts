import { connectBT, listenBT, remindPage, closeBT } from '@/utils/bluetooth';
import { BluetoothModule } from '@/store/modules/bluetooth';
import { CommonModule } from '@/store/modules/common';
import { returnHex, updateBattery } from '@/api/user';
import { writeData, getAuth, notifyBattery, notifyService } from '@/api/bluetooth';
import { AB2Hex, Hex2Int } from '@/utils/util';
import { servicesBT } from '@/utils/handlerBT';


export default function () {
  return new Promise((resolve, reject) => {
    // 连接蓝牙
    connectBT(BluetoothModule.deviceId).then(async (res) => {
      listenBT(channelCallback, batteryCallback);
      if(BluetoothModule.auth) {      
        await servicesBT(BluetoothModule.deviceId)
        await getAuth(BluetoothModule.auth)

        // 开启事件监听
        await notifyBattery();
        await notifyService();
      }
      resolve(res)
    }).catch(err => {
      console.log(err)
      uni.hideLoading();
      reject(err)
    })
  })
}

// 货道回调
function channelCallback(e:any) {
  returnHex({
    code:  BluetoothModule.deviceCode,
    hex: AB2Hex(e.value),
    machine_id:  CommonModule.machineId,
    order_id: CommonModule.orderId,
    type: BluetoothModule.returnType
  }).then((res:any) => {
    console.log(res, '指令解析返回')
    if(res.msg === '补货成功') {
      writeData(res.data);
      let data = {
        cmd: "d2",
        hex: res.data
      }
      remindPage('feedback', data)
      return
    }

    if(res.msg === '货道测试完成') {
      writeData(res.data);
      return
    }

    if(res.data.cmd === "d1" || res.data.cmd === "d2") {
      writeData(res.data.hex)

      // 如果用户关闭页面，延时断开连接
      if(res.data.cmd === "d2" && CommonModule.unLoad) {
        setTimeout(() => {
          if(CommonModule.unLoad) {
            closeBT(BluetoothModule.deviceId).catch((err:any) => {
              console.log(err)
            });
          }
        }, 6000)
      }
      
    }
    remindPage('feedback', res.data)
  })
}

// 电池回调
function batteryCallback(e:any) {
  let battery:any = AB2Hex(e.value);
  battery = Hex2Int(battery);
  if(battery <= 20 && BluetoothModule.battery !== battery) {
    updateBattery({battery});
  }
  BluetoothModule.SET_BLUETOOTH({ battery })
  remindPage('battery', battery);
}