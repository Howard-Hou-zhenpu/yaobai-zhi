import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

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

  if (keywords.length < 3) {
    if (decisions.length < 3) return null;
    return (
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide">你反复思考的话题</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            记录多一些后，会看到你反复思考的话题。
          </p>
        </CardContent>
      </Card>
    );
  }

  const top = keywords.slice(0, 4);
  const rest = keywords.slice(4);

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide">你反复思考的话题</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {top.map(([word, count]) => (
            <div key={word} className="rounded-xl border border-border/50 bg-card/60 p-3">
              <p className="text-sm font-medium text-[#3d3428] leading-snug line-clamp-2 break-words">{word}</p>
              <p className="text-[11px] text-muted-foreground mt-1.5 tabular-nums">出现 {count} 次</p>
            </div>
          ))}
        </div>
        {rest.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {rest.map(([word, count]) => (
              <span
                key={word}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary/40 text-[11px] text-[#6b5d4f]"
              >
                {word}
                <span className="text-muted-foreground tabular-nums">·{count}</span>
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
