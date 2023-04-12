type TagItem = {
  name?: string;
  description?: string;
  prompt?: string;
  labels?: string[];
};
export type TagsList = {
  data?: TagItem[];
};
export type LabelsList = {
  data?: string[];
};
