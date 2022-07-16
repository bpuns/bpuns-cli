export interface IFileType {
  // 文件/文件夹的名字
  name: string,
  // 子文件
  children?: IFileType[]
}

export const files: Record<string, IFileType[]> = {
  0: [
    {
      name:     '1',
      children: [
        {
          name:     '1-1',
          children: [
            { name: '1-1-1.txt' },
            { name: '1-1-2.txt' }
          ]
        },
        { name: '1-2.txt' }
      ]
    },
    {
      name:     '2',
      children: [
        {
          name:     '2-1',
          children: [
            { name: '2-1-1.txt' },
            { name: '2-1-2.txt' }
          ]
        },
        { name: '2-2.txt' }
      ]
    },
    { name: '3.txt' }
  ],
  1: [
    { name: '测试空格  哈哈哈1.txt' },
    { name: '测试空格  哈哈哈2.txt' },
    { name: '测试空格  哈哈哈3.txt' },
    { name: 'backendclient 云管理与服务平台-前端\.txt' }
  ]
}