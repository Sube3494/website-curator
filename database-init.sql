-- Website Curator 完整数据库初始化脚本
-- 在 Supabase SQL 编辑器中运行此脚本
-- 此脚本是幂等的，可以安全地重复运行
--
-- 功能包括：
-- - 创建所有必要的表结构和枚举类型
-- - 设置 Row Level Security (RLS) 策略
-- - 创建管理员 RPC 函数
-- - 插入初始数据（分类、标签、示例网站）
-- - 分类名称已汉化为中文

-- ============================================================================
-- 1. 创建枚举类型
-- ============================================================================

-- 创建用户角色枚举
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('user', 'admin', 'super_admin');
    ELSE
        -- 如果枚举存在但缺少 super_admin，则添加它
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'super_admin' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')) THEN
            ALTER TYPE user_role ADD VALUE 'super_admin';
        END IF;
    END IF;
END $$;

-- 创建用户状态枚举
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
        CREATE TYPE user_status AS ENUM ('active', 'inactive');
    END IF;
END $$;

-- 创建网站状态枚举
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'website_status') THEN
        CREATE TYPE website_status AS ENUM ('pending', 'approved', 'rejected');
    END IF;
END $$;

-- ============================================================================
-- 2. 创建通用函数
-- ============================================================================

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- 3. 创建数据表
-- ============================================================================

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role user_role DEFAULT 'user',
  status user_status DEFAULT 'active',
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加 status 字段（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'status') THEN
        ALTER TABLE users ADD COLUMN status user_status DEFAULT 'active';
        UPDATE users SET status = 'active' WHERE status IS NULL;
    END IF;
END $$;

-- 创建用户表更新触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建分类表
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  color_from TEXT NOT NULL,
  color_to TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建网站表
CREATE TABLE IF NOT EXISTS websites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT NOT NULL,
  favicon TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  status website_status DEFAULT 'pending',
  submitted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建网站表更新触发器
DROP TRIGGER IF EXISTS update_websites_updated_at ON websites;
CREATE TRIGGER update_websites_updated_at BEFORE UPDATE ON websites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建标签表
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建网站标签关联表
CREATE TABLE IF NOT EXISTS website_tags (
  website_id UUID REFERENCES websites(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (website_id, tag_id)
);

-- 创建收藏表
CREATE TABLE IF NOT EXISTS favorites (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  website_id UUID REFERENCES websites(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, website_id)
);

-- 创建系统设置表
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建系统设置表更新触发器
DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. 插入初始数据
-- ============================================================================

-- 插入初始分类数据（中文名称）
INSERT INTO categories (name, color_from, color_to) VALUES
  ('开发', 'emerald-500', 'teal-500'),
  ('设计', 'pink-500', 'rose-500'),
  ('内容', 'purple-500', 'indigo-500'),
  ('资源', 'orange-500', 'amber-500'),
  ('工具', 'cyan-500', 'blue-500'),
  ('学习', 'violet-500', 'purple-500')
ON CONFLICT (name) DO NOTHING;

-- 插入初始标签数据
INSERT INTO tags (name) VALUES
  ('code'), ('git'), ('collaboration'), ('design'), ('ui'),
  ('programming'), ('help'), ('community'), ('inspiration'),
  ('portfolio'), ('writing'), ('articles'), ('blog'),
  ('photos'), ('free'), ('stock')
ON CONFLICT (name) DO NOTHING;

-- 插入初始系统设置
INSERT INTO system_settings (key, value, description)
VALUES ('user_submissions', '{"enabled": true}', '允许普通用户提交网站')
ON CONFLICT (key) DO NOTHING;

-- 插入示例网站数据
INSERT INTO websites (title, url, description, category_id, status, favicon)
SELECT
  'GitHub',
  'https://github.com',
  'The world''s leading software development platform where millions of developers collaborate on code.',
  (SELECT id FROM categories WHERE name = '开发'),
  'approved',
  'https://github.com/favicon.ico'
WHERE NOT EXISTS (SELECT 1 FROM websites WHERE url = 'https://github.com');

INSERT INTO websites (title, url, description, category_id, status, favicon)
SELECT
  'Figma',
  'https://figma.com',
  'Collaborative interface design tool for creating beautiful user interfaces and prototypes.',
  (SELECT id FROM categories WHERE name = '设计'),
  'approved',
  'https://static.figma.com/app/icon/1/favicon.png'
WHERE NOT EXISTS (SELECT 1 FROM websites WHERE url = 'https://figma.com');

INSERT INTO websites (title, url, description, category_id, status, favicon)
SELECT
  'Stack Overflow',
  'https://stackoverflow.com',
  'The largest online community for programmers to learn, share knowledge, and build careers.',
  (SELECT id FROM categories WHERE name = '开发'),
  'approved',
  'https://cdn.sstatic.net/Sites/stackoverflow/Img/favicon.ico'
WHERE NOT EXISTS (SELECT 1 FROM websites WHERE url = 'https://stackoverflow.com');

INSERT INTO websites (title, url, description, category_id, status, favicon)
SELECT
  'Dribbble',
  'https://dribbble.com',
  'Creative community showcasing design work and connecting designers worldwide.',
  (SELECT id FROM categories WHERE name = '设计'),
  'approved',
  'https://cdn.dribbble.com/assets/favicon-b38525134603b9513b5abe1d4e1d5d8b1d8b.ico'
WHERE NOT EXISTS (SELECT 1 FROM websites WHERE url = 'https://dribbble.com');

INSERT INTO websites (title, url, description, category_id, status, favicon)
SELECT
  'Medium',
  'https://medium.com',
  'Platform for reading and writing stories on topics that matter to you.',
  (SELECT id FROM categories WHERE name = '内容'),
  'approved',
  'https://miro.medium.com/v2/1*m-R_BkNf1Qjr1YbyOIJY2w.png'
WHERE NOT EXISTS (SELECT 1 FROM websites WHERE url = 'https://medium.com');

INSERT INTO websites (title, url, description, category_id, status, favicon)
SELECT
  'Unsplash',
  'https://unsplash.com',
  'Beautiful free photos and images shared by talented photographers.',
  (SELECT id FROM categories WHERE name = '资源'),
  'approved',
  'https://unsplash.com/favicon-32x32.png'
WHERE NOT EXISTS (SELECT 1 FROM websites WHERE url = 'https://unsplash.com');

-- 为网站添加标签
INSERT INTO website_tags (website_id, tag_id)
SELECT w.id, t.id
FROM websites w, tags t
WHERE w.title = 'GitHub' AND t.name IN ('code', 'git', 'collaboration')
AND NOT EXISTS (SELECT 1 FROM website_tags wt WHERE wt.website_id = w.id AND wt.tag_id = t.id);

INSERT INTO website_tags (website_id, tag_id)
SELECT w.id, t.id
FROM websites w, tags t
WHERE w.title = 'Figma' AND t.name IN ('design', 'ui', 'collaboration')
AND NOT EXISTS (SELECT 1 FROM website_tags wt WHERE wt.website_id = w.id AND wt.tag_id = t.id);

INSERT INTO website_tags (website_id, tag_id)
SELECT w.id, t.id
FROM websites w, tags t
WHERE w.title = 'Stack Overflow' AND t.name IN ('programming', 'help', 'community')
AND NOT EXISTS (SELECT 1 FROM website_tags wt WHERE wt.website_id = w.id AND wt.tag_id = t.id);

INSERT INTO website_tags (website_id, tag_id)
SELECT w.id, t.id
FROM websites w, tags t
WHERE w.title = 'Dribbble' AND t.name IN ('design', 'inspiration', 'portfolio')
AND NOT EXISTS (SELECT 1 FROM website_tags wt WHERE wt.website_id = w.id AND wt.tag_id = t.id);

INSERT INTO website_tags (website_id, tag_id)
SELECT w.id, t.id
FROM websites w, tags t
WHERE w.title = 'Medium' AND t.name IN ('writing', 'articles', 'blog')
AND NOT EXISTS (SELECT 1 FROM website_tags wt WHERE wt.website_id = w.id AND wt.tag_id = t.id);

INSERT INTO website_tags (website_id, tag_id)
SELECT w.id, t.id
FROM websites w, tags t
WHERE w.title = 'Unsplash' AND t.name IN ('photos', 'free', 'stock')
AND NOT EXISTS (SELECT 1 FROM website_tags wt WHERE wt.website_id = w.id AND wt.tag_id = t.id);

-- ============================================================================
-- 5. 启用 Row Level Security (RLS)
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6. 创建 RLS 策略
-- ============================================================================

-- 删除现有策略（如果存在）
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;

-- Users 表策略
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 管理员可以查看所有用户
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'admin' OR users.role = 'super_admin')
    )
  );

-- 管理员可以更新其他用户（但有权限限制）
CREATE POLICY "Admins can update users" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users current_user
      WHERE current_user.id = auth.uid()
      AND (current_user.role = 'admin' OR current_user.role = 'super_admin')
      AND (
        -- 超级管理员可以修改任何用户（除了不能修改自己）
        (current_user.role = 'super_admin' AND users.id != auth.uid()) OR
        -- 普通管理员只能修改普通用户的状态，不能修改角色
        (current_user.role = 'admin' AND users.role = 'user' AND users.id != auth.uid())
      )
    )
  );

-- 删除现有网站策略（如果存在）
DROP POLICY IF EXISTS "Everyone can view approved websites" ON websites;
DROP POLICY IF EXISTS "Admins can view all websites" ON websites;
DROP POLICY IF EXISTS "Authenticated users can submit websites" ON websites;
DROP POLICY IF EXISTS "Admins can update websites" ON websites;
DROP POLICY IF EXISTS "Admins can delete websites" ON websites;

-- Websites 表策略
CREATE POLICY "Everyone can view approved websites" ON websites
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Admins can view all websites" ON websites
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'admin' OR users.role = 'super_admin')
    )
  );

CREATE POLICY "Authenticated users can submit websites" ON websites
  FOR INSERT WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Admins can update websites" ON websites
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'admin' OR users.role = 'super_admin')
    )
  );

CREATE POLICY "Admins can delete websites" ON websites
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'admin' OR users.role = 'super_admin')
    )
  );

-- 删除现有收藏策略（如果存在）
DROP POLICY IF EXISTS "Users can manage their own favorites" ON favorites;

-- Favorites 表策略
CREATE POLICY "Users can manage their own favorites" ON favorites
  FOR ALL USING (auth.uid() = user_id);

-- 删除现有分类和标签策略（如果存在）
DROP POLICY IF EXISTS "Everyone can view categories" ON categories;
DROP POLICY IF EXISTS "Everyone can view tags" ON tags;
DROP POLICY IF EXISTS "Everyone can view website_tags" ON website_tags;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
DROP POLICY IF EXISTS "Admins can manage tags" ON tags;

-- Categories 表策略
CREATE POLICY "Everyone can view categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'admin' OR users.role = 'super_admin')
    )
  );

-- Tags 表策略
CREATE POLICY "Everyone can view tags" ON tags
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage tags" ON tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'admin' OR users.role = 'super_admin')
    )
  );

-- Website_tags 表策略
CREATE POLICY "Everyone can view website_tags" ON website_tags
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage website_tags" ON website_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'admin' OR users.role = 'super_admin')
    )
  );

-- 删除现有系统设置策略（如果存在）
DROP POLICY IF EXISTS "All authenticated users can view system settings" ON system_settings;
DROP POLICY IF EXISTS "Only admins can view system settings" ON system_settings;
DROP POLICY IF EXISTS "Only admins can update system settings" ON system_settings;
DROP POLICY IF EXISTS "Only admins can insert system settings" ON system_settings;
DROP POLICY IF EXISTS "Only super admins can delete system settings" ON system_settings;

-- System_settings 表策略
CREATE POLICY "All authenticated users can view system settings" ON system_settings
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can update system settings" ON system_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'admin' OR users.role = 'super_admin')
    )
  );

CREATE POLICY "Only admins can insert system settings" ON system_settings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'admin' OR users.role = 'super_admin')
    )
  );

CREATE POLICY "Only super admins can delete system settings" ON system_settings
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- ============================================================================
-- 7. 创建 RPC 函数
-- ============================================================================

-- 删除现有的 RPC 函数（如果存在）
DROP FUNCTION IF EXISTS update_category_admin(UUID, JSONB);

-- 创建管理员更新分类的 RPC 函数
CREATE OR REPLACE FUNCTION update_category_admin(
  category_id UUID,
  category_updates JSONB
)
RETURNS categories
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role user_role;
  updated_category categories;
BEGIN
  -- 检查用户是否已认证
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION '用户未登录';
  END IF;

  -- 获取当前用户角色（绕过 RLS）
  SELECT role INTO current_user_role
  FROM users
  WHERE id = auth.uid();

  -- 检查用户权限
  IF current_user_role IS NULL THEN
    RAISE EXCEPTION '用户不存在';
  END IF;

  IF current_user_role NOT IN ('admin', 'super_admin') THEN
    RAISE EXCEPTION '权限不足：只有管理员可以更新分类';
  END IF;

  -- 执行更新操作（绕过 RLS）
  UPDATE categories
  SET
    name = COALESCE((category_updates->>'name')::TEXT, name),
    color_from = COALESCE((category_updates->>'color_from')::TEXT, color_from),
    color_to = COALESCE((category_updates->>'color_to')::TEXT, color_to)
  WHERE id = category_id
  RETURNING * INTO updated_category;

  -- 检查是否找到并更新了记录
  IF updated_category IS NULL THEN
    RAISE EXCEPTION '分类不存在或更新失败';
  END IF;

  RETURN updated_category;
END;
$$;

-- 创建管理员添加分类的 RPC 函数
CREATE OR REPLACE FUNCTION create_category_admin(
  category_data JSONB
)
RETURNS categories
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role user_role;
  new_category categories;
BEGIN
  -- 检查用户是否已认证
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION '用户未登录';
  END IF;

  -- 获取当前用户角色
  SELECT role INTO current_user_role
  FROM users
  WHERE id = auth.uid();

  -- 检查用户权限
  IF current_user_role IS NULL THEN
    RAISE EXCEPTION '用户不存在';
  END IF;

  IF current_user_role NOT IN ('admin', 'super_admin') THEN
    RAISE EXCEPTION '权限不足：只有管理员可以创建分类';
  END IF;

  -- 执行插入操作
  INSERT INTO categories (name, color_from, color_to)
  VALUES (
    (category_data->>'name')::TEXT,
    (category_data->>'color_from')::TEXT,
    (category_data->>'color_to')::TEXT
  )
  RETURNING * INTO new_category;

  RETURN new_category;
END;
$$;

-- 创建管理员删除分类的 RPC 函数
CREATE OR REPLACE FUNCTION delete_category_admin(
  category_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role user_role;
  deleted_count INTEGER;
BEGIN
  -- 检查用户是否已认证
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION '用户未登录';
  END IF;

  -- 获取当前用户角色
  SELECT role INTO current_user_role
  FROM users
  WHERE id = auth.uid();

  -- 检查用户权限
  IF current_user_role IS NULL THEN
    RAISE EXCEPTION '用户不存在';
  END IF;

  IF current_user_role NOT IN ('admin', 'super_admin') THEN
    RAISE EXCEPTION '权限不足：只有管理员可以删除分类';
  END IF;

  -- 执行删除操作
  DELETE FROM categories WHERE id = category_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  IF deleted_count = 0 THEN
    RAISE EXCEPTION '分类不存在或删除失败';
  END IF;

  RETURN TRUE;
END;
$$;

-- ============================================================================
-- 8. 创建索引以提高性能
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_role_status ON users(role, status);
CREATE INDEX IF NOT EXISTS idx_websites_status ON websites(status);
CREATE INDEX IF NOT EXISTS idx_websites_category_id ON websites(category_id);
CREATE INDEX IF NOT EXISTS idx_websites_submitted_by ON websites(submitted_by);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_website_id ON favorites(website_id);
CREATE INDEX IF NOT EXISTS idx_website_tags_website_id ON website_tags(website_id);
CREATE INDEX IF NOT EXISTS idx_website_tags_tag_id ON website_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);

-- ============================================================================
-- 8. 添加表和字段注释
-- ============================================================================

COMMENT ON TYPE user_role IS '用户角色：user=普通用户，admin=管理员，super_admin=超级管理员';
COMMENT ON TYPE user_status IS '用户状态：active=活跃，inactive=禁用';
COMMENT ON TYPE website_status IS '网站状态：pending=待审核，approved=已批准，rejected=已拒绝';

COMMENT ON TABLE users IS '用户表';
COMMENT ON TABLE categories IS '网站分类表';
COMMENT ON TABLE websites IS '网站信息表';
COMMENT ON TABLE tags IS '标签表';
COMMENT ON TABLE website_tags IS '网站标签关联表';
COMMENT ON TABLE favorites IS '用户收藏表';
COMMENT ON TABLE system_settings IS '系统设置表，存储各种系统配置';

COMMENT ON COLUMN users.status IS '用户状态：active=活跃，inactive=禁用';
COMMENT ON COLUMN system_settings.key IS '设置键名，唯一标识一个设置项';
COMMENT ON COLUMN system_settings.value IS 'JSON格式的设置值';
COMMENT ON COLUMN system_settings.description IS '设置项描述';

-- ============================================================================
-- 9. 验证安装
-- ============================================================================

-- 显示创建的表
SELECT 'Tables created successfully:' as status;
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('users', 'categories', 'websites', 'tags', 'website_tags', 'favorites', 'system_settings')
ORDER BY table_name;

-- 显示初始数据统计
SELECT 'Initial data summary:' as info;
SELECT
  (SELECT COUNT(*) FROM categories) as categories_count,
  (SELECT COUNT(*) FROM tags) as tags_count,
  (SELECT COUNT(*) FROM websites) as websites_count,
  (SELECT COUNT(*) FROM system_settings) as settings_count;

-- 完成提示
SELECT '✅ Website Curator 数据库初始化完成！' as message;
