import { request } from '@/service/request';

/** 获取包厢列表 */
export function fetchGetRoomList(params?: Api.Room.RoomSearchParams) {
  return request<Api.Room.RoomList>({
    url: '/service/room/list',
    method: 'get',
    params
  });
}

/** 获取包厢详情 */
export function fetchGetRoomDetail(roomId: number) {
  return request<Api.Room.Room>({
    url: `/service/room/${roomId}`,
    method: 'get'
  });
}

/** 删除包厢 */
export function fetchDeleteRoom(roomIds: string[]) {
  return request({
    url: `/service/room/${roomIds}`,
    method: 'delete'
  });
}

/** 新增包厢 */
export function fetchAddRoom(data: any) {
  return request({
    url: '/service/room',
    method: 'post',
    data
  });
}

/** 编辑包厢 */
export function fetchEditRoom(data: any) {
  return request({
    url: '/service/room',
    method: 'put',
    data
  });
}
/** 获取二维码 */
export function fetchWxQrCode(params: any) {
  return request<Api.Room.RoomQurCode>({
    url: '/service/room/getWxQrCode',
    method: 'get',
    params
  });
}
