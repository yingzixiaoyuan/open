import { useRequest } from 'ahooks';
import { useState, useCallback } from 'react';
import  { getTags, getLabels } from '@/services/welcome/api';
import type { TagItem } from '@/services/welcome/typings.d';
 
export default  ()=> {
  // const tagsFunction = (async () => {
  //   const data = await getTags({ label: props.label });
  //   const result = data?.data as TagItem[];
  //   // setList(result);
  // })
  const [tags, setTags] = useState<TagItem[]>([])
  const getTagsFunc = useCallback(async (key?:string) => {
    const data = await getTags({ label: key });
    const result = data?.data as TagItem[];
    setTags(result);
  },[]);

  // const [tags, setTags] = useState([])
  // const getTagsFunc = useCallback(async (key:string) => {
  //   const data = await getTags({ label: key });
  //   const result = data?.data;
  //   setTags(result);
  // },[]);

  // const { data: tags} = useRequest(async (key:string) => {
  //   const res = await getTags({label:key});
  //   if (res) {
  //     return res?.data;
  //   }
  //   return [];
  // });
  const { data: labels } = useRequest(async () => {
    const res = await getLabels();
    if (res) {
      return res?.data;
    }
    return [];
  });
  return {
    tags,
    labels,
    getTagsFunc,
  };
};