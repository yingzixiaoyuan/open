// @ts-ignore
/* eslint-disable */
import { request } from 'umi';
import type { TagsList, LabelsList } from './typings';

// 获取所有的tags
export async function getTags(
  params: {
    label?: string;
  },
  options?: {},
) {
  return request<TagsList>('/api/tags', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

// 获取所有的labels
export async function getLabels(options?: {}) {
  return request<LabelsList>('/api/labels', {
    method: 'GET',
    ...(options || {}),
  });
}
