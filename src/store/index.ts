import Vue from 'vue';
import vuex from 'vuex';
import { CommonStore } from './modules/common';
import { BluetoothStore } from './modules/bluetooth';
Vue.use(vuex);

export interface VuexStore{
  common: CommonStore,
  bluetooth: BluetoothStore
}

export default new vuex.Store<VuexStore>({})