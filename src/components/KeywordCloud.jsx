import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

const STOP_WORDS = new Set(['的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这', '他', '她', '它', '们', '那', '被', '从', '把', '还', '对', '与', '让', '向', '给', '用', '以', '及', '等', '但', '而', '或', '如果', '因为', '所以', '虽然', '但是', '可以', '应该', '需要', '能够', '是否', '如何', '什么', '怎么', '哪个', '这个', '那个', '做', '想', '能', '吗', '呢', '吧', '啊', '哦', '嗯']);

function extractKeywords(decisions) {
  const wordCount = {};
  decisions.forEach((d) => {
    const text = `${d.title} ${d.description || ''} ${d.review || ''}`;
    const words = text.split(/[\s，。、！？；：""''（）\-\+\/\\|,.\?!;:'"()\[\]{}]+/).filter(Boolean);
    words.forEach((w) => {
      if (w.length >= 2 && !STOP_WORDS.has(w) && !/^\d+$/.test(w)) {
        wordCount[w] = (wordCount[w] || 0) + 1;
      }
    });
  });
  return Object.entries(wordCount)
    .filter(([, count]) => count >= 2)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 12);
}

export default function KeywordCloud({ decisions }) {
  const keywords = extractKeywords(decisions);
  if (keywords.length < 3) return null;

  const maxCount = keywords[0]?.[1] || 1;

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide">你在反复思考的</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {keywords.map(([word, count]) => {
            const intensity = Math.max(0.5, count / maxCount);
            return (
              <Badge
                key={word}
                variant="outline"
                className="rounded-lg transition-all"
                style={{ opacity: 0.4 + intensity * 0.6, fontSize: `${11 + intensity * 3}px` }}
              >
                {word}
              </Badge>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
