const DAILY_PROMPTS = [
  '你现在最犹豫的是什么？',
  '如果不考虑别人的看法，你会怎么选？',
  '上一次让你骄傲的决定是什么？',
  '有没有一个决定，你一直在拖延？',
  '此刻最占据你心思的事情是？',
  '如果一年后回头看，你希望自己做了什么？',
  '你最近做的最勇敢的选择是？',
  '有什么事情，你其实心里已经有答案了？',
  '你在害怕什么？那个最坏的结果真的会发生吗？',
  '如果这个决定不可逆，你还会这样选吗？',
  '你做这个决定是为了自己，还是为了别人？',
  '五年后的你，会感谢今天的哪个选择？',
  '你最近有没有因为犹豫而错过什么？',
  '如果朋友遇到同样的问题，你会怎么建议？',
  '这个决定里，什么是你真正在意的？',
  '你上一次后悔的决定，教会了你什么？',
  '现在困扰你的，是选择本身，还是对未知的恐惧？',
  '有没有什么选择，是你一直想做但不敢开始的？',
  '你最近一次凭直觉做的决定，结果怎么样？',
  '如果没有经济压力，你会怎么选？',
  '这件事最让你纠结的点是什么？',
  '你有没有发现，很多担心其实从未发生？',
  '做完这个决定后，你希望自己是什么感觉？',
  '你现在需要的是更多信息，还是更多勇气？',
  '回想一下，你最满意的决定有什么共同点？',
  '如果可以同时选两个，你会怎么组合？',
  '这个选择会影响你多久？一周？一年？十年？',
  '你有没有在用别人的标准来衡量自己的选择？',
  '安静下来，你的第一反应是什么？',
  '今天，有什么值得认真想一想的事吗？',
  '你最近有没有为一个好决定庆祝过？',
];

const EMPTY_STATE_MESSAGES = [
  '今天有什么值得认真想一想的事吗？',
  '每一个选择都值得被认真对待',
  '安静下来，听听内心的声音',
  '记录选择，是了解自己的开始',
];

const REVIEW_GUIDES = [
  '现在回头看，当时最在意的，其实是什么？',
  '如果重来一次，你会做出不同的选择吗？',
  '这个决定教会了你什么？',
  '你从这次经历中，更了解自己了吗？',
  '下次遇到类似的情况，你会怎么做？',
  '这个结果和你预期的一样吗？',
];

const COMPLETION_FEEDBACKS = [
  '你又更了解自己了一点',
  '每一次复盘，都是成长的印记',
  '记录下来的经验，不会被遗忘',
  '感谢你认真对待每一个选择',
];

export function getDailyPrompt() {
  const today = new Date();
  const dayIndex = (today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate()) % DAILY_PROMPTS.length;
  return DAILY_PROMPTS[dayIndex];
}

export function getEmptyStateMessage() {
  const index = Math.floor(Math.random() * EMPTY_STATE_MESSAGES.length);
  return EMPTY_STATE_MESSAGES[index];
}

export function getReviewGuide() {
  const index = Math.floor(Math.random() * REVIEW_GUIDES.length);
  return REVIEW_GUIDES[index];
}

export function getCompletionFeedback() {
  const index = Math.floor(Math.random() * COMPLETION_FEEDBACKS.length);
  return COMPLETION_FEEDBACKS[index];
}
