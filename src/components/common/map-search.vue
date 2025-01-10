<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue';
import { useScriptTag } from '@vueuse/core';
import { AMAP_SDK_URL } from '@/constants/map-sdk';
window._AMapSecurityConfig = {
  securityJsCode: "a2d290f4bae733bd8a1feb9bc72960bc",
};
interface Location {
  address: string;
  latitude: number;
  longitude: number;
}

const visible = defineModel<boolean>('visible');

const emit = defineEmits<{
  confirm: [location: Location];
}>();

const { load } = useScriptTag(AMAP_SDK_URL);
const mapRef = ref<HTMLDivElement>();
const searchInput = ref('');
const searchResults = ref<any[]>([]);

let map: any;
let marker: any;
let placeSearch: any;
const selectedLocation = ref<Location>({
  address: '',
  latitude: 0,
  longitude: 0
});

async function initMap() {
  try {
    await load(true);
    if (typeof AMap === 'undefined') {
      console.error('AMap not loaded');
      return;
    }
    if (!mapRef.value) return;

    if (map) {
      map.destroy();
    }

    map = new AMap.Map(mapRef.value, {
      zoom: 13,
      center: [113.392517,22.517024],
      viewMode: '2D'
    });

    marker = new AMap.Marker({
      draggable: true,
      map
    });

    AMap.plugin(['AMap.PlaceSearch', 'AMap.Geocoder'], () => {
      placeSearch = new AMap.PlaceSearch({
        city: '中山市'
      });
    });

    map.on('click', (e: any) => {
      const lnglat = e.lnglat;
      updateMarkerPosition(lnglat.getLng(), lnglat.getLat());
    });
  } catch (error) {
    console.error('Map initialization failed:', error);
  }
}

function handleSearch() {
  if (!searchInput.value || !placeSearch) return;

  placeSearch.search(searchInput.value, (status: string, result: any) => {
    console.log('搜索', status, result);

    if (status === 'complete' && result.poiList?.pois) {
      searchResults.value = result.poiList.pois;
    } else {
      searchResults.value = [];
      window.$message?.error('搜索失败，请重试');
    }
  });
}

function handleSelectPlace(place: any) {
  const { location, name, address } = place;
  map.setCenter([location.lng, location.lat]);
  updateMarkerPosition(location.lng, location.lat, `${address}`);
  searchResults.value = [];
}

function updateMarkerPosition(lng: number, lat: number, address?: string) {
  marker.setPosition([lng, lat]);
  selectedLocation.value = {
    longitude: lng,
    latitude: lat,
    address: address || `${lng},${lat}`
  };
}

function handleConfirm() {
  emit('confirm', selectedLocation.value);
  visible.value = false;
}

function handleClose() {
  visible.value = false;
}

watch(visible, newVal => {
  if (newVal) {
    nextTick(() => {
      initMap();
    });
  } else {
    searchResults.value = [];
    searchInput.value = '';
  }
});

onMounted(() => {
  // 不在这里初始化地图，改为在弹窗打开时初始化
});
</script>

<template>
  <NModal
    v-model:show="visible"
    preset="dialog"
    title="选择位置"
    style="width: 800px"
    :mask-closable="false"
    :segmented="true"
  >
    <div class="map-search-container">
      <div class="search-box">
        <NInputGroup>
          <NInput v-model:value="searchInput" placeholder="请输入地址" @keyup.enter="handleSearch" />
          <NButton type="primary" @click="handleSearch">搜索</NButton>
        </NInputGroup>

        <div v-if="searchResults.length" class="search-results">
          <NScrollbar style="max-height: 200px">
            <div v-for="item in searchResults" :key="item.id" class="search-item" @click="handleSelectPlace(item)">
              <div class="name">{{ item.name }}</div>
              <div class="address">{{ item.address }}</div>
            </div>
          </NScrollbar>
        </div>
      </div>

      <div ref="mapRef" class="map-container" />

      <div class="footer">
        <NButton @click="handleClose">取消</NButton>
        <NButton type="primary" @click="handleConfirm">确定</NButton>
      </div>
    </div>
  </NModal>
</template>

<style scoped>
.map-search-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.search-box {
  position: relative;
  z-index: 1000;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #eee;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.search-item {
  padding: 8px 12px;
  cursor: pointer;
}

.search-item:hover {
  background: #f5f5f5;
}

.name {
  font-weight: 500;
}

.address {
  font-size: 12px;
  color: #666;
}

.map-container {
  height: 400px;
  width: 100%;
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden;
}

.footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
