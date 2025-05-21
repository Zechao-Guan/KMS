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
- Track reading status | 追踪阅读状态
- Search and filter functionality | 搜索和筛选功能
- Statistics and analytics | 统计和分析功能

### Vocabulary Management | 词汇管理
- Build and maintain your vocabulary list | 构建和维护词汇表
- Add words with definitions and examples | 添加单词及其释义和例句
- Track learning progress | 追踪学习进度
- Review words effectively | 高效复习单词

## Tech Stack | 技术栈

- **Frontend**: Next.js 14, React, Tailwind CSS
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS with custom gradients and animations | 带有自定义渐变和动画的 Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts

## Getting Started | 开始使用

### Prerequisites | 前置要求

- Node.js 18.0 or later | Node.js 18.0 或更高版本
- npm or yarn
- Supabase account | Supabase 账号

### Supabase Setup | Supabase 设置

1. Create a Supabase Account | 创建 Supabase 账号:
   - Go to [https://supabase.com](https://supabase.com)
   - Sign up for a free account | 注册一个免费账号
   - Create a new project | 创建新项目

2. Set up Database Tables | 设置数据库表:

```sql
-- Papers table | 论文表
create table papers (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  link text,
  note text,
  status text default 'unread',
  tags text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Words table | 单词表
create table words (
  id uuid default uuid_generate_v4() primary key,
  word text not null,
  definition text,
  example text,
  learned boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) | 启用行级安全
alter table papers enable row level security;
alter table words enable row level security;

-- Create policies | 创建策略
create policy "Enable read access for all users" on papers for select using (true);
create policy "Enable insert for authenticated users only" on papers for insert with check (auth.role() = 'authenticated');
create policy "Enable update for authenticated users only" on papers for update using (auth.role() = 'authenticated');
create policy "Enable delete for authenticated users only" on papers for delete using (auth.role() = 'authenticated');

-- Create trigger for updating updated_at | 创建更新 updated_at 的触发器
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language 'plpgsql';

create trigger update_papers_updated_at
    before update on papers
    for each row
    execute function update_updated_at_column();
```

3. Get API Keys | 获取 API 密钥:
   - Go to Project Settings > API | 进入项目设置 > API
   - Copy the `Project URL` and `anon` public key | 复制 `Project URL` 和 `anon` 公钥
   - Add these to your `.env.local` file | 将这些添加到 `.env.local` 文件中

### Installation | 安装步骤

1. Clone the repository | 克隆仓库:
```bash
git clone https://github.com/Zechao-Guan/KMS.git
cd KMS
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

## Features in Detail | 功能详解

### Paper Management | 论文管理
- Add new papers with title, authors, and publication details | 添加包含标题、作者和出版详情的新论文
- Tag papers for easy categorization | 为论文添加标签以便分类
- Store paper links and personal notes | 存储论文链接和个人笔记
- Filter papers by tags | 按标签筛选论文
- Track reading status (read/unread) | 追踪阅读状态（已读/未读）
- Search papers by title | 按标题搜索论文
- View paper statistics and analytics | 查看论文统计和分析
- Responsive design for all devices | 适配所有设备的响应式设计

### Vocabulary Management | 词汇管理
- Add new words with definitions | 添加新单词及其释义
- Include example sentences | 包含例句
- Track learning progress | 追踪学习进度
- Review words with spaced repetition | 使用间隔重复复习单词
- Search and filter functionality | 搜索和筛选功能

## Project Structure | 项目结构

```
KMS/
├── app/           # Next.js app directory | Next.js 应用目录
├── components/    # Reusable UI components | 可复用的 UI 组件
├── lib/          # Utility functions and configurations | 工具函数和配置
├── public/       # Static assets | 静态资源
├── styles/       # Global styles | 全局样式
└── types/        # TypeScript type definitions | TypeScript 类型定义
```

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
- [Recharts](https://recharts.org/)
- [Lucide Icons](https://lucide.dev/)

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