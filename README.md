# Knowledge Hub | 知识中心

A modern, elegant knowledge management system built with Next.js, Tailwind CSS, and Supabase. This application helps you manage academic papers and vocabulary effectively.

一个使用 Next.js、Tailwind CSS 和 Supabase 构建的现代优雅的知识管理系统，帮助你高效管理学术论文和词汇。

## Features | 功能特点

### Paper Management | 论文管理
- Track and organize academic papers | 追踪和组织学术论文
- Add tags for better categorization | 添加标签实现更好的分类
- Store paper links and notes | 存储论文链接和笔记
- Filter papers by tags | 按标签筛选论文
- Beautiful and intuitive interface | 美观直观的界面

### Vocabulary Management | 词汇管理
- Build and maintain your vocabulary list | 构建和维护词汇表
- Add words with definitions and examples | 添加单词及其释义和例句
- Track learning progress | 追踪学习进度
- Review words effectively | 高效复习单词

## Tech Stack | 技术栈

- **Frontend**: Next.js 14, React, Tailwind CSS
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **Database**: Supabase
- **Styling**: Tailwind CSS with custom gradients and animations | 带有自定义渐变和动画的 Tailwind CSS
- **Icons**: Lucide React

## Getting Started | 开始使用

### Prerequisites | 前置要求

- Node.js 18.0 or later | Node.js 18.0 或更高版本
- npm or yarn
- Supabase account | Supabase 账号

### Installation | 安装步骤

1. Clone the repository | 克隆仓库:
```bash
git clone https://github.com/yourusername/knowledge-hub.git
cd knowledge-hub
```

2. Install dependencies | 安装依赖:
```bash
npm install
```

3. Set up environment variables | 配置环境变量:
Create a `.env.local` file in the root directory with the following variables | 在根目录创建 `.env.local` 文件并添加以下变量:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server | 运行开发服务器:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser | 在浏览器中打开 [http://localhost:3000](http://localhost:3000)

## Project Structure | 项目结构

```
knowledge-hub/
├── components/     # Reusable UI components | 可复用的 UI 组件
├── pages/         # Next.js pages | Next.js 页面
├── public/        # Static assets | 静态资源
├── styles/        # Global styles | 全局样式
└── types/         # TypeScript type definitions | TypeScript 类型定义
```

## Features in Detail | 功能详解

### Paper Management | 论文管理
- Add new papers with title, authors, and publication details | 添加包含标题、作者和出版详情的新论文
- Tag papers for easy categorization | 为论文添加标签以便分类
- Store paper links and personal notes | 存储论文链接和个人笔记
- Filter papers by tags | 按标签筛选论文
- Responsive design for all devices | 适配所有设备的响应式设计

### Vocabulary Management | 词汇管理
- Add new words with definitions | 添加新单词及其释义
- Include example sentences | 包含例句
- Track learning progress | 追踪学习进度
- Review words with spaced repetition | 使用间隔重复复习单词
- Search and filter functionality | 搜索和筛选功能

## Contributing | 贡献指南

Contributions are welcome! Please feel free to submit a Pull Request.

欢迎贡献代码！请随时提交 Pull Request。

## License | 许可证

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

本项目采用 MIT 许可证 - 详情请查看 [LICENSE](LICENSE) 文件。

## Acknowledgments | 致谢

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Framer Motion](https://www.framer.com/motion/)

## Deployment | 部署

### Deploy to Vercel | 部署到 Vercel

1. Push your code to GitHub | 将代码推送到 GitHub:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Go to [Vercel](https://vercel.com) and sign in with your GitHub account | 访问 [Vercel](https://vercel.com) 并使用 GitHub 账号登录

3. Click "New Project" | 点击 "New Project"

4. Import your repository | 导入你的仓库:
   - Select the repository | 选择仓库
   - Click "Import" | 点击 "Import"

5. Configure your project | 配置项目:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next
   - Install Command: `npm install`

6. Add Environment Variables | 添加环境变量:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL | 你的 Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key | 你的 Supabase Anon Key

7. Click "Deploy" | 点击 "Deploy"

### Automatic Deployments | 自动部署

- Every push to the main branch will trigger a new deployment | 每次推送到主分支都会触发新的部署
- Preview deployments are created for pull requests | 为拉取请求创建预览部署
- You can configure deployment settings in the Vercel dashboard | 你可以在 Vercel 仪表板中配置部署设置

### Custom Domain | 自定义域名

1. Go to your project settings in Vercel | 在 Vercel 中进入项目设置
2. Click "Domains" | 点击 "Domains"
3. Add your custom domain | 添加你的自定义域名
4. Follow the DNS configuration instructions | 按照 DNS 配置说明操作

### Environment Variables | 环境变量

Make sure to add these environment variables in your Vercel project settings | 确保在 Vercel 项目设置中添加以下环境变量:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
``` 