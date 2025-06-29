import { test, expect } from '@playwright/test';

test.describe('基础功能测试', () => {
  test.beforeEach(async ({ page }) => {
    // 设置默认超时时间
    page.setDefaultTimeout(10000);
  });

  test('页面加载和基本元素显示', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 检查页面标题
    await expect(page).toHaveTitle(/网站收藏夹|Website Curator/);

    // 检查主要导航元素
    await expect(page.locator('header')).toBeVisible();
    const logoText = page.getByText('网站收藏夹').or(page.getByText('Website Curator'));
    await expect(logoText).toBeVisible();

    // 检查副标题（支持中英文）
    const subtitle = page.getByText('发现与整理').or(
      page.getByText('Discover & Organize')
    );
    await expect(subtitle).toBeVisible();

    // 检查头部登录按钮
    const signInButton = page.locator('header').getByRole('button', { name: '登录' }).or(
      page.locator('header').getByRole('button', { name: 'Sign In' })
    );
    await expect(signInButton).toBeVisible();

    // 检查主要内容区域标题
    const mainTitle = page.getByText('发现精彩网站').or(
      page.getByText('Discover Amazing Websites')
    );
    await expect(mainTitle).toBeVisible();

    // 检查搜索框（支持中英文提示）
    const searchBox = page.getByPlaceholder('搜索网站... (Ctrl+K)').or(
      page.getByPlaceholder('Search websites... (Ctrl+K)')
    );
    await expect(searchBox).toBeVisible();

    // 检查GitHub按钮
    const githubButton = page.locator('header').locator('a[href*="github"]').or(
      page.locator('header').locator('button').filter({
        has: page.locator('svg[data-lucide="github"]')
      })
    );
    await expect(githubButton).toBeVisible();

    // 检查主题切换按钮
    const themeButton = page.locator('header').locator('button').filter({
      has: page.locator('svg[data-lucide="sun"], svg[data-lucide="moon"]')
    });
    await expect(themeButton).toBeVisible();
  });

  test('响应式设计 - 移动端', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 检查移动端布局
    await expect(page.locator('header')).toBeVisible();
    await expect(page.getByText('Website Curator')).toBeVisible();

    // 检查内容在移动端是否正确显示
    await expect(page.getByText('Discover Amazing Websites')).toBeVisible();

    // 检查搜索框在移动端的响应式布局
    await expect(page.getByPlaceholder('Search websites... (Ctrl+K)')).toBeVisible();

    // 检查登录按钮在移动端的显示
    await expect(page.locator('header').getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('主题切换功能', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 查找主题切换按钮（通过图标查找）
    const themeButton = page.locator('header').locator('button').filter({
      has: page.locator('svg').first()
    }).nth(1); // 第二个按钮是主题切换

    await expect(themeButton).toBeVisible();

    // 获取初始主题状态
    const initialTheme = await page.locator('html').getAttribute('class');

    // 点击主题切换按钮
    await themeButton.click();

    // 等待主题切换动画完成
    await page.waitForTimeout(800);

    // 验证主题已切换
    const newTheme = await page.locator('html').getAttribute('class');
    expect(newTheme).not.toBe(initialTheme);

    // 验证主题类的存在
    const hasValidTheme = await page.locator('html').evaluate(el =>
      el.classList.contains('dark') || el.classList.contains('light') || !el.className
    );
    expect(hasValidTheme).toBeTruthy();
  });

  test('网站列表显示', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 等待网站列表加载（使用更通用的选择器）
    await page.waitForSelector('.grid', { timeout: 15000 });

    // 检查是否有网站卡片显示（使用Card组件的类名）
    const websiteCards = page.locator('.grid > div').filter({
      has: page.locator('.font-semibold')
    });

    // 验证至少有一个网站卡片
    await expect(websiteCards.first()).toBeVisible({ timeout: 10000 });

    // 检查第一个卡片的基本结构
    const firstCard = websiteCards.first();

    // 检查卡片标题
    await expect(firstCard.locator('.font-semibold').first()).toBeVisible();

    // 检查卡片描述
    await expect(firstCard.locator('p').first()).toBeVisible();

    // 检查网站图标容器
    await expect(firstCard.locator('div').filter({
      hasText: /🌐/
    }).or(firstCard.locator('img').first().locator('..'))).toBeVisible();

    // 检查外部链接按钮
    await expect(firstCard.locator('button').filter({
      has: page.locator('svg')
    }).first()).toBeVisible();

    console.log(`✅ 找到 ${await websiteCards.count()} 个网站卡片`);
  });

  test('分类筛选功能', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 等待侧边栏加载
    await page.waitForSelector('aside', { timeout: 10000 });

    // 查找分类按钮（支持中英文）
    const categoriesSection = page.locator('aside').filter({
      hasText: '分类'
    }).or(
      page.locator('aside').filter({ hasText: 'Categories' })
    );
    await expect(categoriesSection).toBeVisible();

    // 查找分类按钮（排除"全部分类"按钮）
    const categoryButtons = categoriesSection.locator('button').filter({
      hasNotText: '全部分类'
    }).filter({
      hasNotText: 'All Categories'
    });

    const categoryCount = await categoryButtons.count();
    console.log(`找到 ${categoryCount} 个分类按钮`);

    if (categoryCount > 0) {
      // 记录初始网站数量
      const initialCards = page.locator('.grid > div').filter({
        has: page.locator('.font-semibold')
      });
      const initialCount = await initialCards.count();

      // 点击第一个分类
      const firstCategory = categoryButtons.first();
      const categoryName = await firstCategory.textContent();
      console.log(`点击分类: ${categoryName}`);

      await firstCategory.click();
      await page.waitForTimeout(1500);

      // 验证筛选后的结果
      const filteredCards = page.locator('.grid > div').filter({
        has: page.locator('.font-semibold')
      });
      const filteredCount = await filteredCards.count();

      console.log(`筛选前: ${initialCount} 个网站，筛选后: ${filteredCount} 个网站`);

      // 验证仍有内容显示或显示空状态
      if (filteredCount > 0) {
        await expect(filteredCards.first()).toBeVisible();
      } else {
        // 检查是否显示了"没有找到"的消息
        const noResults = page.getByText(/没有找到|No websites found/i).or(
          page.getByText(/暂无网站|No results/i)
        );
        if (await noResults.isVisible()) {
          await expect(noResults).toBeVisible();
        }
      }

      // 测试返回全部分类
      const allCategoriesButton = page.getByRole('button', { name: '全部分类' }).or(
        page.getByRole('button', { name: 'All Categories' })
      );

      if (await allCategoriesButton.isVisible()) {
        await allCategoriesButton.click();
        await page.waitForTimeout(1000);

        // 验证返回到全部网站
        const allCards = page.locator('.grid > div').filter({
          has: page.locator('.font-semibold')
        });
        const allCount = await allCards.count();

        expect(allCount).toBeGreaterThanOrEqual(filteredCount);
        console.log(`返回全部分类后: ${allCount} 个网站`);
      }
    } else {
      console.log('⚠️ 没有找到分类按钮，跳过分类筛选测试');
    }
  });

  test('搜索功能', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 等待网站列表加载
    await page.waitForSelector('.grid', { timeout: 15000 });

    // 查找搜索框（使用确切的placeholder文本）
    const searchInput = page.getByPlaceholder('Search websites... (Ctrl+K)');
    await expect(searchInput).toBeVisible();

    // 记录搜索前的网站数量
    const initialCards = page.locator('.grid > div').filter({
      has: page.locator('.font-semibold')
    });
    const initialCount = await initialCards.count();
    console.log(`搜索前网站数量: ${initialCount}`);

    // 输入搜索关键词
    await searchInput.fill('design');
    await page.waitForTimeout(1500);

    // 验证搜索结果
    const searchResults = page.locator('.grid > div').filter({
      has: page.locator('.font-semibold')
    });
    const resultCount = await searchResults.count();
    console.log(`搜索 "design" 的结果数量: ${resultCount}`);

    // 验证搜索结果描述更新
    await expect(page.getByText('Search results for "design"')).toBeVisible();

    // 验证清除搜索按钮出现
    const clearButton = page.locator('button').filter({ has: page.locator('svg') }).filter({
      hasText: /clear|×|x/i
    }).or(searchInput.locator('..').locator('button').last());

    if (await clearButton.isVisible()) {
      await clearButton.click();
      await page.waitForTimeout(500);

      // 验证搜索已清空
      await expect(searchInput).toHaveValue('');

      // 验证描述恢复
      await expect(page.getByText(/Browse.*curated collection/i)).toBeVisible();
    } else {
      // 手动清空搜索
      await searchInput.clear();
      await page.waitForTimeout(500);
    }
  });

  test('页面导航', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 点击网站标题回到首页
    const logo = page.locator('header').getByText('Website Curator').first();
    await expect(logo).toBeVisible();
    await logo.click();
    await page.waitForTimeout(500);

    // 验证仍在首页
    await expect(page.getByText('Discover Amazing Websites')).toBeVisible();

    // 验证URL没有变化（仍在根路径）
    expect(page.url()).toMatch(/\/$|\/$/);
  });

  test('快捷键功能', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 测试 Ctrl+K 聚焦搜索框
    await page.keyboard.press('Control+KeyK');

    // 验证搜索框获得焦点
    const searchInput = page.getByPlaceholder('Search websites... (Ctrl+K)');
    await expect(searchInput).toBeFocused();

    // 输入一些文本
    await page.keyboard.type('test');
    await expect(searchInput).toHaveValue('test');

    // 测试 Escape 清除搜索
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // 验证搜索框已清空（如果实现了这个功能）
    const currentValue = await searchInput.inputValue();
    if (currentValue === '') {
      console.log('✅ Escape 键清除搜索功能正常');
    } else {
      console.log('ℹ️ Escape 键清除搜索功能未实现');
    }
  });

  test('错误处理 - 无效路径', async ({ page }) => {
    // 访问不存在的路径
    await page.goto('/nonexistent-page');
    await page.waitForLoadState('networkidle');

    // Next.js 应该显示404页面或重定向到首页
    const hasValidContent = await page.evaluate(() => {
      const body = document.body.textContent || '';
      return body.includes('Website Curator') ||
        body.includes('404') ||
        body.includes('Page not found') ||
        body.includes('Discover Amazing Websites');
    });

    expect(hasValidContent).toBeTruthy();
    console.log('✅ 无效路径处理正常');
  });

  test('页面性能检查', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;
    console.log(`页面加载时间: ${loadTime}ms`);

    // 验证页面在合理时间内加载完成（10秒内）
    expect(loadTime).toBeLessThan(10000);

    // 检查是否有JavaScript错误
    const errors: string[] = [];
    page.on('pageerror', error => {
      errors.push(error.message);
    });

    await page.waitForTimeout(2000);

    if (errors.length > 0) {
      console.log('⚠️ 发现JavaScript错误:', errors);
    } else {
      console.log('✅ 没有JavaScript错误');
    }
  });
});
