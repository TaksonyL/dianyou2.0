declare module "*.vue" {
    import Vue from 'vue'
    export default Vue

    declare module "vue/types/vue" {
      interface Vue {
        $dkm: any;
      }
    }
}




declare module "uview-ui"