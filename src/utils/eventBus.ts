import mitt from 'mitt';

type Events = {
  'shop-change': string; // shopId
};

export const eventBus = mitt<Events>();
