<template>
  <div class="fork" :style="`margin-left:${deep * 20}px`">
    <div class="item">
      <div class="icon" @click="onclick">
        {{ icon }}
      </div>
      <span class="fileName" @click="openDir">
        {{ dirName }}
      </span>
      <span class="ext">
        {{ safeExt(data) }}
      </span>
    </div>
    <div class="block" v-if="!isFold && isDir">
      <Fork v-for="item in dirs" :key="item.hash" :root="root" :data="item" :deep="deep+1" :hash="item.hash"
            :dir-name="item.fileName" :path="`${path}/${item.fileName}`"/>
    </div>
  </div>
</template>

<script setup>
import {computed, ref} from "vue";
import {bus} from "../vendor/bus.ts";
import {BUS_EVENT} from "../vendor/constants.ts";

const props = defineProps({
  data: Object,
  deep: Number,
  hash: String,
  dirName: String,
  root: Object,
  path: String
})

const isDir = computed(() => props.data.isDir || props.deep === 0)
const isFold = ref(true)
const icon = computed(() => {
  if (isDir.value) {
    return isFold.value ? '→' : '↓'
  } else {
    return 'FILE'
  }
})
const dirs = computed(() => props.deep === 0 ? props.data.dirs : props.root[props.hash])
const safeExt = item => {
  if (item.isFile) {
    if (item.memo) {
      return item.memo.ext
    } else {
      console.warn(item)
      return '?'
    }
  } else {
    return '/'
  }
}

const onclick = () => {
  if (isDir.value) {
    isFold.value = !isFold.value
  }
  bus.emit(String(BUS_EVENT.FORK_CLICK), {
    ...props
  })
}
const openDir = () => {
  if (props.data.isDir || props.dirName === 'root') {
    isFold.value = false
    bus.emit(String(BUS_EVENT.FORK_CLICK), {
      ...props
    })
  }
}
</script>

<style scoped>
.item {
  display: flex;
  padding: 5px 15px;
}

.icon {
  margin-right: 10px;
  text-transform: uppercase;
}


.fileName {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: 15px;
}

.ext {
  width: 80px;
}
</style>
