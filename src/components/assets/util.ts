type SetFieldValue = (field: string, value: unknown) => void;

interface TagFormValues {
  newTag: string;
  tags: string[];
}

export const handleNewTagChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  setFieldValue: SetFieldValue
) => {
  setFieldValue("newTag", e.target.value);
};

export const handleNewTagKeyDown = (
  e: React.KeyboardEvent<HTMLInputElement>,
  values: TagFormValues,
  setFieldValue: SetFieldValue,
  quickTags: string[]
) => {
  if (e.key === "Enter") {
    e.preventDefault();
    tryAddTag(values, setFieldValue, quickTags);
  }
};

export const tryAddTag = (
  values: TagFormValues,
  setFieldValue: SetFieldValue,
  quickTags: string[]
) => {
  const tag = values.newTag.trim().toLowerCase();
  if (tag && !values.tags.includes(tag) && !quickTags.includes(tag)) {
    setFieldValue("tags", [...values.tags, tag]);
    setFieldValue("newTag", "");
  }
};
