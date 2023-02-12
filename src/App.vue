<script setup>
import {axiosInstance} from "./vendor/http";
import {computed, reactive} from "vue";
import Fork from "./components/Fork.vue";
import {bus} from "./vendor/bus";
import {BUS_EVENT} from "./vendor/constants";
import {Fancybox} from "@fancyapps/ui";
import md5 from 'js-md5'

const store = reactive({
  data: {},
  path: "",
  activeItem: {},
  history: ['dirs'],
  staticURL: "",
  itemSize: 250,
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

const back = (item, deep) => {
  const paths = deep.path.split('/')
  paths.pop()
  store.activeItem = {...item, path: paths.join('/')}
}

const list = computed(() => {
  if (store.activeItem) {
    if (store.activeItem.isBack) return store.activeItem.relativePath === '' ? store.data.dirs : store.data[store.activeItem.hash]
    else if (store.activeItem.deep === 0) return store.data.dirs
    else if (store.activeItem.data && store.activeItem?.data?.isDir) return store.data[store.activeItem.hash]
    else if (store.data.isFile) return store.data
    return []
  }
  return []
})

const openImageGallery = (src, type) => {
  if(type === 'video') return Fancybox.show([{src,type}])
  let startIndex = 0
  const showList = list.value.filter(item => item.isFile && item.memo.mime.startsWith('image'))
      .map((item, index) => {
        const _src = getPath(store.staticURL, item.relativePath)
        if (_src === src) startIndex = index
        return {src: _src, type}
      })
  Fancybox.show(showList, {startIndex})
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

const getPath = (pre, suf) => {
  return pre.replace(/\/$/g, '') + suf
}

const hashFileName = name => md5(name)
</script>

<template>
  <div class="container">
    <div class="left">
      <Fork :root="store.data"
            :data="store.data"
            :deep="0"
            dir-name="root"
            path="root"/>
    </div>
    <div class="right">
      <div class="top">
        <span class="path">
          {{ store.activeItem.path || '/' }}
        </span>
        <span class="itemSizeInput">
          项目大小:<input type="text"
                          v-model.lazy.trim.number="store.itemSize">
        </span>
      </div>
      <div class="main"
           :style="{
        gridTemplateColumns: `repeat(auto-fill, ${store.itemSize}px)`
      }">
        <div class="item"
             v-for="item in list"
             :key="item.hash || 'root'"
             :style="{
          width:`${store.itemSize}px`,
          height: `${store.itemSize}px`,
        }"
             @click="clickItem(item)">
          <template v-if="item.isBack">
            <div style="position: absolute;width: 100%;height: 100%;"
                 @click="back(item,{...store.activeItem})">
              ..
            </div>
          </template>
          <template v-if="item.isDir">
            DIR
          </template>
          <template v-if="item.memo">
            <template v-if="item.memo.mime.startsWith('image')">
              <img :src="getPath(store.staticURL , item.relativePath)"
                   alt=""
                   @click="openImageGallery(getPath(store.staticURL , item.relativePath),'image')"/>
            </template>
            <template v-if="item.memo.mime.startsWith('video')">
              <video :src="getPath(store.staticURL , item.relativePath)"
                     @click="openImageGallery(getPath(store.staticURL , item.relativePath),'video')"></video>
            </template>
          </template>
          <template v-else>
            ?
          </template>
          <a v-if="item.isFile"
             class="download"
             :download="hashFileName(item.fileName)"
             :href="getPath(store.staticURL , item.relativePath)">
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

<style scoped
       lang="scss">
.container {
  display: flex;
}

.left {
  width: 500px;
}

.top {
  min-height: 100px;
  padding: 10px 0;
  display: flex;
  justify-content: center;

  .path {
    flex: 1;
  }

  .itemSizeInput {
    input {
      box-sizing: content-box;
      height: 25px;
      margin: 0 15px;
      padding: 0 10px;
      border-radius: 5px;
    }
  }
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
    font-size: 12px;

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
