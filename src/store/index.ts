import Vue from 'vue';
import vuex from 'vuex';
import { CommonStore } from './modules/common';
Vue.use(vuex);

export interface VuexStore{
  common: CommonStore,
}

export default new vuex.Store<VuexStore>({})