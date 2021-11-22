<template>
	<view class="pageIndex">
    <Navbar :params="{title: '首页'}" :back="false" />

    <u-swiper v-if="banner.length > 0" name="url" :list="banner" height="350" mode="rect" border-radius="0"
     :interval="banner[bannerIndex].time*1000" @change="bannerChange"></u-swiper>

    <view class="toolbar p30 block-between">
      <view class="left block-between">
        <view class="iconWrap">
          <image v-if="bluetooth" src="/static/images/bluetooth.svg" mode="aspectFill"></image>
          <image v-else src="/static/images/bluetooth-off.svg" mode="aspectFill"></image>
        </view>
        设备编号：{{machineCode || '暂无设备'}}
      </view>
      <view class="right block-between">
        <view class="iconWrap">
          <view class="batterWrap">
            <Battery :number="battery"/>  
          </view>
          <view>帮助</view>
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

    <view class="goodslist p30 block-between">
      
      <block v-for="(item, index) in goodsListFiler" :key="index">
        <GoodsItem :item="item" :mode="userType" @update="update()" @adult="adultShow === true"/>  
      </block>

      <view class="emptyWrap" v-if="goodsList.length === 0">
        <image src="/static/images/no-sign.png"/>
        <view>等待蓝牙连接...</view>
      </view>
      

    </view>


    <!-- 小程序用户授权 -->
    <Authorize @login="getIndexData"/>

    <!-- 成人验证 -->
    <Adult :show="adultShow" @cancel="()=>{adultShow = false}"/>

    <!-- 蓝牙开关提醒 -->
    <Toast :show="toastShow" @confirm="()=>{ toastShow = false }" @maskClick="()=>{ toastShow = false }"/>

    <Tabbar v-if="tabShow" :current="0" />
	</view>
</template>

<script lang="ts">
  import { Component, Prop, Vue, Mixins } from "vue-property-decorator";
  import Bluetooth from '@/mixins/bluetooth';

  import Navbar from '@/components/navbar/navbar.vue';
  import Tabbar from '@/components/tabbar/tabbar.vue';
  import Battery from '@/components/battery/battery.vue';
  import Authorize from '@/components/authorize/authorize.vue';
  import Adult from '@/components/adult/adult.vue';
  import Toast from '@/components/toast/toast.vue';
  import GoodsItem from './goodsItem.vue';

  import { getBanner, getInfo } from '@/api/user';
  import { login } from '@/utils/util';
  import { CommonModule } from "@/store/modules/common";

  @Component({
    components: {
      Navbar, Battery, GoodsItem, Authorize, Adult, Tabbar, Toast
    }
  })
  export default class extends Mixins(Bluetooth){
    private machineCode:string = ''      // 设备编号
    private banner:{url:string, time:number}[] = [];       // 轮播图
    private bannerIndex:Number = 0;      // 轮播图下标

    private battery:number = 0;          // 电池电量
    private bluetooth:boolean = false    // 蓝牙开关
    
    private isFirst:boolean = true;      // 是否首次加载
    private loading:boolean = false;     // 加载等待
    private goodsList:any[] = [];        // 商品列表
    private userType:0|1 = 0;            // 0-用户 1-补货员
    private adultShow:boolean = false    // 成人验证显示
    private tabShow:boolean = false      // 底部导航栏加载
    private toastShow:boolean = false    // 蓝牙开关提醒
    private toastTimer:any = null        // 蓝牙开关轮询

    readonly debug:boolean = false        // 购买界面调试模式
    
    // 商品过滤
    get goodsListFiler() {
      let list:any[] = [];
      if(this.goodsList.length > 0) {
        list = this.goodsList.filter(item => {
          if(this.userType === 0) {
            return item.channel_status === 1;
          } else {
            return item
          }
        })
      }
      return list;
    }

    // 获取轮播图
    getBanner() {
      let that = this
      getBanner({machine_code: this.machineCode}).then(res => {
        that.banner = res.data.map((item:any) => {
          return {
            url: CommonModule.url + '/uploads/adv/' + item.resource_file,
            time: item.carousel_duration_time
          }
        })
      }).catch(err => {})
    }
    // 轮播图变更
    bannerChange(e:number) {
      this.bannerIndex = e;
    }

    /**
     * 获取首页信息
     */
    async getIndexData() {
      let that = this;
      if(!CommonModule.bt)  return
      if(!CommonModule.userInfo) return           // 等待用户信息获取
      if(!CommonModule.bt.status.connect && !that.debug) return  // 等待蓝牙连接
      if(that.loading) return
      that.loading = true;
      let { code } = await login();
      getInfo({
        code: code,
        userInfo: CommonModule.userInfo,
        machineCode: CommonModule.machineCode,
        mf_data: CommonModule.bt.device.advertisData || '0201070702d307018b2ff302032002042702050203069d3404ff464452'
      }).then(res => {
        uni.showLoading({
          title: '加载中',
          mask: true
        })
        console.log(res)
        that.goodsList = res.data.goodsList;

        if(that.isFirst) {
          that.isFirst = false
        } else {
          that.loading = false;
          uni.hideLoading();
          return
        } // 若不是首次加载，跳过下面部分

        CommonModule.bt.connectHandler(res.data);                 // 蓝牙操作

        that.userType = res.data.user_type;
        
        CommonModule.SET_MACHINE_ID(res.data.machine.machine_id)  // 设置设备ID
        CommonModule.SET_USERTYPE(res.data.user_type);            // 设置用户类型
        that.tabShow = true;

        if(res.data.machine.machine_check_adult === 1) {
          CommonModule.SET_ADULT(res.data.user.user_is_adult);    // 开启成人验证(是否开启成人验证)
        }

        that.loading = false;
        uni.hideLoading();
      }).catch(err => {
        console.log('请求错误')
      })
    }


    // 回调数据更新
    update() {
      this.getIndexData();
    }

    onLoad(options:any) {
      let that = this;
      that.onBluetooth(options).then(res => {
        that.machineCode = CommonModule.machineCode;
        that.getBanner();

        // 监听连接状态返回
        CommonModule.bt.getConnect(() => {
          that.isFirst = true;
          that.getIndexData();
        })

        if(that.debug) {
          // 调试模式
          that.getIndexData();
          return
        }

        // 循环检测蓝牙状态
        if(that.toastTimer) clearInterval(that.toastTimer);
        that.toastTimer = setInterval(() => {
          that.bluetooth = CommonModule.bt.status.init;
          that.toastShow = !CommonModule.bt.status.init;
          that.battery = CommonModule.bt.battery;
        }, 3000)
        that.onShowLoad();
      })
    }

    onShow() {
      this.onShowLoad()
    }

    onShowLoad() {
      let that = this;
      if(CommonModule.bt) {
        this.battery = CommonModule.bt.battery;
        CommonModule.bt.onReturn((res) => {
          console.log('反馈指令', res)
          if(res.type === 'feedback') {
            that.getIndexData();
          }
        })  
      }

      if(CommonModule.goodsUpdate) {
        CommonModule.SET_GOODS_UPDATE(false);
        this.getIndexData();
      }
    }
  }
</script>

<style lang='scss' scoped>
.pageIndex{
  .toolbar{
    background-color: $back-color;
    height: 100rpx;
    .left{
      .iconWrap{
        display: inline-block;
        margin-right: 10rpx;
        image{
          width: 48rpx;
          height: 48rpx;
        }
      }
    }
    .right{
      font-size: 20rpx;
      .iconWrap{
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
        width: 80rpx;
        height: 80rpx;
      }
      .batterWrap{
        width: 48rpx;
        height: 48rpx;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }

  .goodslist{
    padding-top: 30rpx;
  }
}
</style>
