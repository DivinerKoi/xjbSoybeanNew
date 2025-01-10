/**
 * 构造树型结构数据
 *
 * @param {any} data 数据源
 * @param {any} id id字段 默认 'id'
 * @param {any} parentId 父节点字段 默认 'parentId'
 * @param {any} children 孩子节点字段 默认 'children'
 */
// eslint-disable-next-line max-params
export function handleTree<T extends { [key: string]: unknown }>(
  data: T[],
  id?: string,
  parentId?: string,
  children?: string
) {
  const config = {
    id: id || 'id',
    parentId: parentId || 'parentId',
    childrenList: children || 'children'
  };

  const childrenListMap: { [keys: string]: unknown } = {};
  const nodeIds: { [keys: string]: unknown } = {};
  const tree: T[] = [];

  for (const d of data) {
    const pId = d[config.parentId];
    if ((typeof pId === 'string' || typeof pId === 'number') && !childrenListMap[pId]) {
      childrenListMap[pId] = [];
    }
    const dataId = d[config.id];
    (typeof dataId === 'string' || typeof dataId === 'number') && (nodeIds[dataId] = d);
    if (typeof pId === 'string' || typeof pId === 'number') {
      const cList = childrenListMap[pId];
      Array.isArray(cList) && cList.push(d);
    }
  }

  for (const d of data) {
    const pId = d[config.parentId];
    // eslint-disable-next-line eqeqeq,no-eq-null
    if ((typeof pId === 'string' || typeof pId === 'number') && nodeIds[pId] == null) {
      tree.push(d);
    }
  }

  for (const t of tree) {
    adaptToChildrenList(t);
  }

  function adaptToChildrenList(o: { [keys: string]: unknown }) {
    const pId = o[config.id];
    if ((typeof pId === 'string' || typeof pId === 'number') && childrenListMap[pId] !== null) {
      o[config.childrenList] = childrenListMap[pId];
    }
    const cList = o[config.childrenList];
    if (Array.isArray(cList)) {
      for (const c of cList) {
        adaptToChildrenList(c);
      }
    }
  }
  return tree;
}

/**
 * 判断path是否为外链
 *
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path: string) {
  return /^(https?:|mailto:|tel:)/.test(path);
}
