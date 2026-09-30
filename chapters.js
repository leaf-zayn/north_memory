// 稳定章节 ID 与地点关联独立于美术和文案，后续回忆存储可通过 chapterId 关联。
// memories 是扩展契约，不表示本版已经具备上传、账号或云端保存能力。
export const chapters = [
  { id: 'harbin', location: '哈尔滨', placeIds: ['saint-sophia', 'central-street'], artwork: 'harbin-story.png', memories: [],
    note: { title: '先把自己交给一场雪', body: '想象傍晚走进一条暖灯亮起的街。鞋底踩过积雪，围巾里藏着呼出的白气。先不急着去下一个地方，站在这里，看看雪怎么落下来。' } },
  { id: 'train', location: '向北的途中', placeIds: [], artwork: 'train-story.png', memories: [],
    note: { title: '车窗替我们收集远方', body: '这是绘本里的一段夜行，不是一张具体车票。雪林从窗前缓缓退去，暖黄的车厢里，还有没聊完的话。旅程也可以什么都不赶。' } },
  { id: 'mohe', location: '漠河', placeIds: ['beiji-village', 'longjiang-first-bend'], artwork: 'mohe-story.png', memories: [],
    note: { title: '给北方的夜，留一点想象', body: '木屋、雪地、林线，还有亮起的窗。绘本把一抹极光留在了夜空里；真正抵达时，无论有没有极光，都值得和身边的人一起抬头。' } },
  { id: 'memories', location: '我们的冬天', placeIds: [], artwork: 'mohe-story.png', memories: [] },
];
