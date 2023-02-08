<script setup>
import {axiosInstance} from "./vendor/http";
import {computed, reactive} from "vue";
import Fork from "./components/Fork.vue";
import {bus} from "./vendor/bus";
import {BUS_EVENT} from "./vendor/constants";
import {Fancybox} from "@fancyapps/ui";

const store = reactive({
  data: {},
  path: "",
  activeItem: {},
  staticURL: "",
})

const fetchData = async () => {
  const res = await axiosInstance.get('/')
  if (res.status === 200) {
    store.data = res.data
    store.path = res.data.root
    store.staticURL = res.data.staticURL
  } else {

  }
}

fetchData()

bus.on(String(BUS_EVENT.FORK_CLICK), data => {
  store.activeItem = {
    ...data
  }
})

const list = computed(() => {
  if (store.activeItem) {
    if (store.activeItem.deep === 0) return store.activeItem.data.dirs
    else if (store.activeItem.data && store.activeItem?.data?.isDir) return store.data[store.activeItem.hash]
    else if (store.data.isFile) return store.data
    return []
  }
  return []
})

const openImageGallery = (src, type) => {
  Fancybox.show([{src, type}])
}
const enterDir = item => {
  store.activeItem = {
    root: store.data,
    data: item,
    deep: store.activeItem.deep + 1,
    dirName: item.fileName,
    hash: item.hash,
    path: `${store.activeItem.path}/${item.fileName}`
  }
}
const clickItem = item => {
  if (item.isDir) return enterDir(item)
}
</script>

<template>
  <div class="container">
    <div class="left">
      <Fork :root="store.data" :data="store.data" :deep="0" dir-name="root" path="root"/>
    </div>
    <div class="right">
      <div class="top">
        {{ store.activeItem.path || '/' }}
      </div>
      <div class="main">
        <div class="item" v-for="item in list" :key="item.hash || 'root'" @click="clickItem(item)">
          <template v-if="item.isDir">
            DIR
          </template>
          <template v-if="item.memo">
            <template v-if="item.memo.mime.startsWith('image')">
              <img :src="store.staticURL + item.relativePath" alt=""
                   @click="openImageGallery(store.staticURL + item.relativePath,'image')"/>
            </template>
            <template v-if="item.memo.mime.startsWith('video')">
              <video :src="store.staticURL + item.relativePath"
                     @click="openImageGallery(store.staticURL + item.relativePath,'video')"></video>
            </template>
          </template>
          <template v-else>
            ?
          </template>
          <a v-if="item.isFile" class="download" :download="item.fileName" :href="store.staticURL + item.relativePath">
            👇
          </a>
          <div class="info">
            <div class="content">
              <div class="name">
                {{ item.fileName }}
              </div>
              <div class="mimo">
                {{ item.memo?.mime }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.container {
  display: flex;
}

.left {
  width: 500px;
}

.main {
  width: calc(100vw - 500px);
  display: grid;
  grid-template-columns: repeat(auto-fill, 250px);
  grid-column-gap: 10px;
}

.item {
  margin: 5px;
  padding: 1px;
  width: 250px;
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background-color: #6e6e72;

  &:hover {
    transform: scale(0.97);
    transition-duration: 0.1s;
  }

  .download {
    position: absolute;
    display: block;
    top: 0;
    right: 0;
    width: 50px;
    height: 50px;
    text-align: center;
    line-height: 50px;
  }

  .info {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    min-height: 50px;
    white-space: pre-wrap;
    word-break: break-all;

    &:after {
      position: absolute;
      display: block;
      content: '';
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(black, 0.4);
    }

    .content {
      position: relative;
      z-index: 10;
    }
  }
}

img, video {
  max-height: 100%;
  max-width: 100%;
}
</style>
