<template>
	<view class="content">
    <navbar :params="{title: '首页'}" />

    <swiper style="height: 350rpx;width: 100vw" :indicator-dots="true" indicator-active-color="rgba(230, 66, 64, .7)" :circular="true"
     :autoplay="true" :interval="banner[bannerIndex].time" @change="bannerChange">

      <block v-if="banner.length === 0">
        <swiper-item>
          <image src="/static/images/banner.jpg" mode="aspectFill"></image>
        </swiper-item>
      </block>
      <block v-else>
        <swiper-item v-for="(item, index) in banner" :key="index">
          <image :src="imgUrl + '/uploads/adv/' + item.resource_file" mode="aspectFill"></image>
        </swiper-item>
      </block>

    </swiper>

    <view class="machine p30">
      <view class="left font-gray">
        <view class="iconWrap">
          <image v-if="bluetooth" src="/static/images/bluetooth.svg" mode="aspectFill"></image>
          <image v-else src="/static/images/bluetooth-off.svg" mode="aspectFill"></image>
        </view>
        设备编号：{{deviceCode || '暂无设备'}}
      </view>
      <view class="right">
        <view class="iconWrap">
          <battery :number="battery"/>
          <view>电量</view>
        </view>
        <view class="iconWrap">
          <u-icon name="info-circle" color="#333" size="40" style="padding: 4rpx"></u-icon>
          <view>帮助</view>
        </view>
        <view class="iconWrap">
          <u-icon name="kefu-ermai" color="#333" size="40" style="padding: 4rpx"></u-icon>
          <view>客服</view>
        </view>
      </view>
    </view>

    <view class="goodlist p30">

    <block v-for="item in goodlistFilter" :key="item.channel_id">
      <navigator  class="item" :url="'/pages/goods_detail/index?id=' + item.channel_goods_id + '&channelId=' + item.channel_id + '&stock=' + item.channel_stock" hover-class="none">
        <view class="imgWrap">
          <image :class="{ saleOut:item.channel_stock === 0 }" v-if="item.goods_pic" :src="imgUrl + item.goods_pic" mode="aspectFit"></image>
          <image v-else src="/static/images/product.png" mode="aspectFit"></image>
          <image v-if="item.channel_stock === 0" class="saleOutImg" src="/static/images/sale_out.png" mode="widthFix" />
        </view>
        <view class="textWrap">
          <view class="name longtext">{{item.goods_name}}</view>
          <view v-if="userType === 0" class="info">
            <view class="font-red">¥{{item.goods_price}}</view>
            <view :class="[item.channel_stock === 0 ? 'buy back-gray' : 'buy back-red']" @click.stop="purchase" :data-stock="item.channel_stock" :data-channelid="item.channel_id" :data-price="item.goods_price">购买</view>
          </view>
          <view v-if="userType === 1" class="manager">
            <view :class="[item.channel_status === 1? 'btn back-blue' : 'btn back-gray']" @click.stop="goodChange"
             :data-status="item.channel_status" :data-channelid="item.channel_id" :data-code="item.channel_code">置换商品</view>
            <view :class="[item.channel_status === 1? 'btn back-blue' : 'btn back-gray']" @click.stop="replenish"
             :data-status="item.channel_status" :data-code="item.channel_code" :data-stock="item.channel_stock">货道补货</view>
          </view>
        </view>
      </navigator>
    </block>

    <block v-if="goodlist.length === 0">
      <view class="waitImg">
        <image src="/static/images/waiting.png" mode="widthFix" />
        <view class="text">亲！请先等待蓝牙连接~</view>
      </view>
    </block>
    
  </view>

  <toast :show="toastShow" @confirm="()=>{ toastShow = false }" @maskClick="()=>{ toastShow = false }"/>
  <authorize v-if="login" @getInfo="getInfo"/>
  <adult :show="adultShow" @cancel="()=>{adultShow = false}"/>
	</view>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from "vue-property-decorator";
  import { CommonModule } from '@/store/modules/common';
  import { BluetoothModule } from '@/store/modules/bluetooth';

  import navbar from '@/components/navbar/navbar.vue';
  import battery from '@/components/battery/battery.vue';
  import authorize from '@/components/authorize/authorize.vue';
  import adult from '@/components/adult/adult.vue';

  import { writeData } from '@/api/bluetooth';
  import { login } from '@/utils/util';
  import { getInfo, getBanner, getDevcode } from '@/api/user';
  import { repChannel } from '@/api/setting';
  import { reconnectBT, findBT } from '@/utils/bluetooth';
  import buy from '@/utils/buy';
  import getBT from '@/utils/getBT';

  @Component({
    components: {
      navbar, battery, authorize, adult
    }
  })
	export default class extends Vue{
    bluetooth:boolean = false;        // 是否打开蓝牙
    deviceCode:string|null = null;    // 设备编号
    battery:number|string = '?';              // 电量

    userType:0|1 = 0;
    login:boolean = false;            // 是否需要登录授权
    adultShow:boolean = false;        // 是否进行成人验证
    goodsUpdate:boolean = false;      // 是否需要更新商品
    toastShow:boolean = false;        // 提示框
    toastTimer:any = null;            // 提示框定时器
    banner:Array<Object> = [];        // banner图
    bannerIndex:number = 0;           // banner当前项

    machineInfo:object = {};
    goodlist:Array<any> = [];
    imgUrl:string = CommonModule.imgUrl;

    goodsChangeChannel:number = 0;           // 商品更换货道
    public onLoadFun:boolean = true;               // onLoad 是否已运行


    /**
     * 商品列表过滤
     */
    get goodlistFilter() {
      let list = this.goodlist.filter((item) => {
        if(this.userType === 0) {
          return item.channel_status === 1;
        } else {
          return item
        }
      })
      return list
    }

    /**
     * 获取设备用户信息
     * @param {object} e 返回数据 
     */
    async getInfo(e:any) {
      let data = e.data;
      // if(data.machine.machine_online == 1) {
      //   uni.showModal({
      //     title: '提示',
      //     content: '设备正在使用',
      //     showCancel: false
      //   })
      //   return
      // }

      BluetoothModule.SET_BLUETOOTH({ auth:data.auth })
      CommonModule.SET_INFO({
        machineId: data.machine.machine_id,
        userType: data.user_type
      })

      if(data.toggleLight) {
        // 判断是否有灯光开关指令
        BluetoothModule.SET_BLUETOOTH({
          lightSwitch: {
            open: data.toggleLight.open,
            close: data.toggleLight.close
          }
        })
      }

      if(data.machine.machine_check_adult === 1) {
        CommonModule.SET_ADULT(data.user.user_is_adult);  // 开启成人验证(是否开启成人验证)
      }
      await getBT();
      uni.showLoading({
        title: '加载中...',
      })

      writeData(data.setNowTime);

      this.machineInfo = data.machine
      this.goodlist = data.goodsList
      this.userType = data.user_type

      uni.hideLoading()
      uni.showTabBar({
        animation: true,
      })
    }

    /**
     * 更新商品列表
     * @param {reload} 是否重载
     */
    async getGoods(reload:boolean = false) {
      let that = this;
      let {code} = await login();
      let data = {
        code, 
        machineCode: BluetoothModule.deviceCode,
        mf_data: BluetoothModule.deviceInfo,
        userInfo: wx.getStorageSync('USER_INFO')
      }
      getInfo(data).then(res => {
        that.goodsUpdate = false;
        that.userType = res.data.user_type;
        if(reload) {
          that.getInfo(res)
          return
        }
        that.goodlist = res.data.goodsList;
      })
    }

    /**
     * 购买
     */
    purchase(e:any) {
      if(e.currentTarget.dataset.stock === 0) {
        wx.showModal({
          title: "提示",
          content: "货道库存不足",
          showCancel: false
        })
        return
      }
      let adult = this.adultCheck();
      if(adult) return;

      let channelId = e.currentTarget.dataset.channelid;
      let price = e.currentTarget.dataset.price
      let data = {
        goodsList: [{channel_id: channelId, goods_num: 1}]
      }
      buy(data, price);
    }

    /**
     * 成人验证
     * @return {boolean} true-需要成人验证  false-不需要成人验证
     */
    adultCheck() {
      if(CommonModule.adult === 2) return false;
      let adult = CommonModule.adult === 0
      this.adultShow = adult
      return adult
    }

    /**
     * 补货指令
     */
    replenish(e:any) {
      if(e.currentTarget.dataset.stock > 0) {
        wx.showModal({
          title: "提示",
          content: '货道不缺货',
          showCancel: false
        })
        return
      } else if (e.currentTarget.dataset.status !== 1) {
        wx.showModal({
          title: "提示",
          content: '货道暂时不可用',
          showCancel: false
        })
        return
      }
      uni.showLoading({
        title: '补货中',
        mask: true
      })
      let data = {
        channel: e.currentTarget.dataset.code
      }
      BluetoothModule.SET_RETURNTYPE(3);
      repChannel(data).then(res => {
        writeData(res.data)
      })
    }

    /**
     * 商品置换
     */
    goodChange(e:any) {
      console.log('商品置换')
       if(e.currentTarget.dataset.status !== 1) {
        wx.showModal({
          title: "提示",
          content: '货道暂时不可用',
          showCancel: false
        })
        return
      }
      this.goodsUpdate = true;
      wx.navigateTo({
        url: '/pages/goods_change/index?channelId=' + e.currentTarget.dataset.channelid + '&code=' + e.currentTarget.dataset.code,
      })
    }

    /**
     * 获取banner图
     */
    getBanner() {
      if(!BluetoothModule.localName) return
      getBanner({machine_code: BluetoothModule.deviceCode}).then(res => {
        if(res.data.length === 0) return
        this.banner = res.data.filter((item:any) => {
          if(item.carousel_duration_time > 0) {
            item.time = item.carousel_duration_time * 1000;
          } else {
            item.time = 2000
          }
          return item.resource_type === 1;
        })
      })
    }
    // banner 滚动
    bannerChange(e:any) {
      this.bannerIndex = e.detail.current;
    }

    async onLoad(options:any) {
      //debug
      // BluetoothModule.SET_BLUETOOTH({
      //   launch: true,
      //   deviceCode: 'LD2012167563',
      //   deviceInfo: '0201070702d307018b2ff302032002042702050203069d3404ff464452'
      // });
      // this.userType = 1;
      // this.getGoods();
      // return
      this.onLoadFun = false;

      // 微信扫码
      // #ifdef MP-WEIXIN
      if(options.q) {
        let param = options.q;
        param = decodeURIComponent(param)
        let arr = param.split('/');
        let id = arr[arr.length-1]
        let { data } = await getDevcode({id});
        options.localName = data;
      } 
      // #endif

      // debug
      options.localName = 'LD0517811880';

      console.log('首页启动', options)
      this.onLoadFun = true;
      if(options.localName) {
        BluetoothModule.SET_BLUETOOTH({ 
          deviceCode: options.localName,
          auth: ''
        })
        this.deviceCode = options.localName
        this.getBanner();
        this.goodlist = [];
        // #ifdef MP-ALIPAY
        reconnectBT(true);
        // #endif
        // #ifdef MP-WEIXIN
        findBT();
        // #endif
        uni.hideTabBar({
          animation: false,
        })
      } else if (BluetoothModule.deviceCode) {
        this.deviceCode = BluetoothModule.deviceCode
        this.getGoods();
        this.goodsUpdate = true;
      } else {
        uni.showModal({
          title: '提示',
          content: '无效设备号',
          showCancel: false,
        })
        return
      }
    }

    onShow() {
      if(this.onLoadFun) {
        // 是否进行重连
        reconnectBT();
      };
      this.getBanner();
      this.toastTimer = setInterval(() => {
        if(this.toastShow === BluetoothModule.launch) {
          this.toastShow = !BluetoothModule.launch
        }
        this.bluetooth = BluetoothModule.launch
      }, 3000)
      if(this.goodsUpdate && BluetoothModule.auth) {
        this.getGoods();

        // 商品置换后补货
        if(this.goodsChangeChannel > 0) {
          let  e = {currentTarget: {dataset: { code: this.goodsChangeChannel, status: 1 }}} 
          this.replenish(e);
          this.goodsChangeChannel = 0
        }
      }
    }

    onHide() {
      clearInterval(this.toastTimer);
      this.toastTimer = null;
    }

    // 监听蓝牙回调
    onBluetooth(e:any) {
      switch(e.type) {
        case 'connect':
          console.log(e, '连接回调')
          this.login = true
          console.log(this.$refs.authorizeBlock)
          break;
        case 'battery':
          this.battery = e.value
          break;
        case 'feedback':
          console.log(e, '出货成功回调')
          if(e.value.cmd === "d2") {
            wx.hideLoading({
              success(res) {},
              fail(err) {}
            })
            this.getGoods();
          }
          break;
        case 'reConnect':
          this.getGoods(true);
          break;
      }
    }
  }
</script>

<style lang="scss" scoped>
.machine{
  background-color: #fff;
  height: 100rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.machine .left{
  font-size: 28rpx;
  display: flex;
  align-items: center;
}
.machine .left .iconWrap{
  display: inline-block;
  width: 48rpx;
  height: 48rpx;
  margin-right: 10rpx;
}
.machine .right{
  display: flex;
  color: #606060;
}
.machine .right .iconWrap{
  font-size: 20rpx;
  width: 80rpx;
  height: 80rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
}
.machine .right .iconWrap .icon{
  font-size: 40rpx;
}


.goodlist{
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-top: 30rpx;
}
.goodlist .item{
  background-color: #fff;
  width: 48%;
  min-width: 320rpx;
  margin-bottom: 30rpx;
  border-radius: 20rpx;
  border: 1px solid #e5e5e5;
  padding: 20rpx;
  box-sizing: border-box;
}
.goodlist .item .imgWrap{
  width: 100%;
  position: relative;
  image{
    width: 100%;
    // height: auto;
    height: 320rpx;
  }
  .saleOut{
    filter: grayscale(70%);
  }
  .saleOutImg{
    position: absolute;
    height: 70rpx;
    z-index: 99;
    top: 20%;
    left: 0;
  }
}
.goodlist .item .textWrap .name{
  font-size: 28rpx;
  margin: 6rpx 0
}
.goodlist .item .textWrap .info{
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.goodlist .item .textWrap .info .buy{
  font-size: 24rpx;
  width: 120rpx;
  height: 44rpx;
  line-height: 44rpx;
  text-align: center;
  border-radius: 4rpx;
}

.goodlist .item .textWrap .manager{
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.goodlist .item .textWrap .manager .btn{
  width: 48%;
  height: 50rpx;
  line-height: 50rpx;
  font-size: 24rpx;
  text-align: center;
  border-radius: 10rpx;
}

.goodlist .waitImg{
  text-align: center;
  width: 100%;
  margin-top: 80rpx;
}
.goodlist .waitImg image{
  width: 80%;
  background-size: cover;
  background-position: center;
}
.goodlist .waitImg .text{
  color: #808080
}
</style>
