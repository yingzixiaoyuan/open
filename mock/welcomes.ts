import { Request, Response } from 'express';

const getTags = (req: Request, res: Response) => {
  const tags = [
    {
      name: '写作助理',
      description: '个人最常使用的 prompt，可用于改进文字段落和句式。',
      prompt:
        '作为一名中文写作改进助理，你的任务是改进所提供文本的拼写、语法、清晰、简洁和整体可读性，同时分解长句，减少重复，并提供改进建议。请只提供文本的更正版本，避免包括解释。请从编辑以下文本开始：[文章内容］',
      labels: ['写作辅助', '常用'],
    },
    {
      name: '提示词修改',
      description:
        '让 ChatGPT 为我们重写提示词，人工书写的提示词逻辑与机器不同，修改后的提示语能更容易被 ChatGPT 理解。',
      prompt:
        '我正试图从 GPT-3.5 的以下提示中获得良好的结果。"原本的提示词（建议英文）"。你能不能写一个更好的提示词，对 GPT-3.5 来说更理想，并能产生更好的结果？',
      labels: ['ai', '常用'],
    },
    {
      name: '提示词修改0',
      description:
        '让 ChatGPT 为我们重写提示词，人工书写的提示词逻辑与机器不同，修改后的提示语能更容易被 ChatGPT 理解。',
      prompt:
        '我正试图从 GPT-3.5 的以下提示中获得良好的结果。"原本的提示词（建议英文）"。你能不能写一个更好的提示词，对 GPT-3.5 来说更理想，并能产生更好的结果？',
      labels: ['ai', '常用'],
    },
    {
      name: '提示词修改1',
      description:
        '让 ChatGPT 为我们重写提示词，人工书写的提示词逻辑与机器不同，修改后的提示语能更容易被 ChatGPT 理解。',
      prompt:
        '我正试图从 GPT-3.5 的以下提示中获得良好的结果。"原本的提示词（建议英文）"。你能不能写一个更好的提示词，对 GPT-3.5 来说更理想，并能产生更好的结果？',
      labels: ['ai', '常用'],
    },
    {
      name: '提示词修改2',
      description:
        '让 ChatGPT 为我们重写提示词，人工书写的提示词逻辑与机器不同，修改后的提示语能更容易被 ChatGPT 理解。',
      prompt:
        '我正试图从 GPT-3.5 的以下提示中获得良好的结果。"原本的提示词（建议英文）"。你能不能写一个更好的提示词，对 GPT-3.5 来说更理想，并能产生更好的结果？',
      labels: ['ai', '常用'],
    },
  ];
  const { label } = req.query;
  if (typeof label === 'string') {
    res.json({ data: tags.filter((item) => item.labels.includes(label)) });
  } else {
    res.json({
      data: tags,
    });
  }
};

const getLabels = (req: Request, res: Response) => {
  res.json({
    data: ['写作辅助', '常用', 'ai'],
  });
};
export default {
  'GET /api/tags': getTags,
  'GET /api/labels': getLabels,
};
