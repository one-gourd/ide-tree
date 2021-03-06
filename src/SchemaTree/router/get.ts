import Router from 'ette-router';
import { buildNormalResponse } from 'ide-lib-base-component';
import { pick } from 'ide-lib-utils';

import { SCHEMA_CONTROLLED_KEYS } from '../schema/';
import { findById } from '../schema/util';
import { IContext, extracFilters, getBufferNode, BUFFER_NODETYPE } from './helper';
import { debugIO } from '../../lib/debug';

export const router = new Router();


/**
 * 默认获取所有的节点，可以通过 filter 返回指定的属性值
 * 比如 /nodes?filter=name,screenId ，返回的集合只有这两个属性
 */
router.get('getAllNodes', '/nodes', function(ctx: IContext) {
  const { stores, request } = ctx;
  const { query } = request;
  const filterArray = extracFilters(query && query.filter, SCHEMA_CONTROLLED_KEYS);
  ctx.response.body = {
    nodes: stores.model.schema.allNodesWithFilter(filterArray)
  };
  ctx.response.status = 200;
});

/**
 *  返回某个节点的 schema 信息 
 */
router.get('getNodeById', '/nodes/:id', function(ctx: IContext) {
  const { stores, request } = ctx;
  const { query } = request;
  const { id } = ctx.params;
  const filterArray = extracFilters(query && query.filter, SCHEMA_CONTROLLED_KEYS);

  ctx.response.body = {
    node: findById(stores.model.schema, id, filterArray)
  };
  ctx.response.status = 200;
});

/**
 *  返回某个节点的 parent 节点信息 
 */
router.get('getNodeParentById', '/nodes/:id/parent', function(ctx: IContext) {
  const { stores, request } = ctx;
  const { query } = request;
  const { id } = ctx.params;

  const node = findById(stores.model.schema, id, ['parentId']);

  const parentId = node && node.parentId;
  debugIO(`[api - getNodeParentById] 找到 parentId: ${parentId}`);

  let message = '';
  let parentNode;

  if(!parentId) {
    message = '当前节点无父节点';
  } else {
    const filterArray = extracFilters(query && query.filter, SCHEMA_CONTROLLED_KEYS);
    parentNode = findById(stores.model.schema, parentId, filterArray);
    message = `父节点 id 为 ${parentId}`;
  }
  buildNormalResponse(ctx, 200, parentNode ? { node: parentNode} : {}, message);
});


/**
 * 返回 buffer 中的 clone 节点信息
 */
router.get('getCloneNode', '/buffers/clone', function(ctx: IContext) {
  const { stores, request } = ctx;
  const { query } = request;
  const filterArray = extracFilters(query && query.filter, SCHEMA_CONTROLLED_KEYS);

  const node = getBufferNode(stores, BUFFER_NODETYPE.CLONED);

  let message = '';
  if (!node) {
    message = '当前缓存区中无 clone 类型节点，问题定位源 `getBufferNode`';
  } else {
    message = `获取成功. clone 节点 id: ${node.id}`
  } 
  
  buildNormalResponse(ctx, 200, { node: node && pick(node, filterArray) }, message);
});

/**
 * 返回当前被选中的节点
 */
router.get('getSelection', '/selection', function (ctx: IContext) {
  const { stores } = ctx;
  buildNormalResponse(ctx, 200, { id: stores.model.selectedId });
});
