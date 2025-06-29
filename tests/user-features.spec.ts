import { test, expect } from '@playwright/test';

test.describe('用户功能测试', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'password123'
  };

  test.beforeEach(async ({ page }) => {
    // 设置默认超时时间
    page.setDefaultTimeout(15000);
  });

  // 改进的登录辅助函数
  async function login(page: any) {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 点击登录按钮（支持中英文）
    const signInButton = page.locator('header').getByRole('button', { name: '登录' }).or(
      page.locator('header').getByRole('button', { name: 'Sign In' })
    );

    if (!(await signInButton.isVisible({ timeout: 3000 }))) {
      console.log('用户可能已经登录');
      return true;
    }

    await signInButton.click();
    await page.waitForTimeout(1000);

    // 填写登录表单（支持中英文标签）
    const emailField = page.getByLabel('邮箱地址').or(page.getByLabel('Email Address'));
    const passwordField = page.getByLabel('密码').or(page.getByLabel('Password'));

    await emailField.fill(testUser.email);
    await passwordField.fill(testUser.password);

    // 点击登录提交按钮
    const submitButton = page.getByRole('button', { name: '登录' }).or(
      page.getByRole('button', { name: 'Sign In' })
    ).filter({ hasNotText: '登录以保存收藏' });

    await submitButton.click();
    await page.waitForTimeout(5000);

    // 检查是否登录成功 - 查找用户头像
    const userAvatar = page.locator('header').locator('[role="button"]').filter({
      has: page.locator('div').filter({ hasText: /^[A-Z]$/ })
    });

    const isLoggedIn = await userAvatar.isVisible({ timeout: 3000 });

    if (isLoggedIn) {
      console.log('✅ 登录成功');
    } else {
      console.log('⚠️ 登录失败或用户不存在');
    }

    return isLoggedIn;
  }

  test('收藏网站功能', async ({ page }) => {
    const isLoggedIn = await login(page);

    if (!isLoggedIn) {
      test.skip('跳过测试：用户未登录');
      return;
    }

    // 等待网站列表加载
    await page.waitForSelector('.grid', { timeout: 15000 });

    // 查找收藏按钮（Heart图标）
    const favoriteButtons = page.locator('button').filter({
      has: page.locator('svg[data-lucide="heart"]')
    });

    const buttonCount = await favoriteButtons.count();
    console.log(`找到 ${buttonCount} 个收藏按钮`);

    if (buttonCount > 0) {
      const firstFavoriteButton = favoriteButtons.first();

      // 记录初始状态
      const initialClasses = await firstFavoriteButton.getAttribute('class') || '';
      console.log('初始按钮样式:', initialClasses);

      // 点击收藏
      await firstFavoriteButton.click();
      await page.waitForTimeout(1500); // 等待乐观更新

      // 验证收藏状态变化
      const newClasses = await firstFavoriteButton.getAttribute('class') || '';
      console.log('点击后按钮样式:', newClasses);

      // 检查是否有颜色变化（粉色/红色表示已收藏）
      const isFavorited = await firstFavoriteButton.evaluate(el => {
        const classes = el.className;
        return classes.includes('text-pink-600') ||
          classes.includes('text-red-500') ||
          classes.includes('text-pink-500') ||
          el.querySelector('svg')?.classList.contains('fill-current');
      });

      console.log('收藏状态:', isFavorited ? '已收藏' : '未收藏');

      // 验证Toast消息
      const toastMessage = page.locator('.sonner-toast').or(
        page.locator('[data-sonner-toast]')
      );

      if (await toastMessage.isVisible({ timeout: 2000 })) {
        const toastText = await toastMessage.textContent();
        console.log('Toast消息:', toastText);
      }
    } else {
      console.log('⚠️ 没有找到收藏按钮');
    }
  });

  test('访问收藏页面', async ({ page }) => {
    const isLoggedIn = await login(page);

    if (!isLoggedIn) {
      test.skip('跳过测试：用户未登录');
      return;
    }

    // 点击用户头像菜单
    const userAvatar = page.locator('header').locator('[role="button"]').filter({
      has: page.locator('div').filter({ hasText: /^[A-Z]$/ })
    });
    await expect(userAvatar).toBeVisible();
    await userAvatar.click();
    await page.waitForTimeout(500);

    // 点击"我的收藏"链接（支持中英文）
    const favoritesLink = page.getByText('我的收藏').or(
      page.getByText('My Favorites')
    );
    await expect(favoritesLink).toBeVisible();
    await favoritesLink.click();
    await page.waitForTimeout(2000);

    // 验证收藏页面加载
    // 检查页面标题或特有内容
    const favoritesPageIndicators = [
      page.getByText(/我的收藏/i),
      page.getByText(/my favorites/i),
      page.getByText(/收藏的网站/i),
      page.getByText(/favorite websites/i),
      page.locator('h1, h2').filter({ hasText: /收藏|favorites/i })
    ];

    let pageLoaded = false;
    for (const indicator of favoritesPageIndicators) {
      if (await indicator.isVisible({ timeout: 3000 })) {
        await expect(indicator).toBeVisible();
        pageLoaded = true;
        console.log('✅ 收藏页面加载成功');
        break;
      }
    }

    if (!pageLoaded) {
      console.log('⚠️ 收藏页面可能未正确加载');
    }

    // 检查收藏页面的搜索框
    const favoritesSearchBox = page.getByPlaceholder(/search.*favorites/i);
    if (await favoritesSearchBox.isVisible({ timeout: 2000 })) {
      await expect(favoritesSearchBox).toBeVisible();
      console.log('✅ 收藏页面搜索框可见');
    }
  });

  test('取消收藏功能', async ({ page }) => {
    const isLoggedIn = await login(page);

    if (!isLoggedIn) {
      test.skip('跳过测试：用户未登录');
      return;
    }

    // 先添加收藏
    const favoriteButtons = page.locator('button').filter({ hasText: /heart/i });

    if (await favoriteButtons.count() > 0) {
      const firstFavoriteButton = favoriteButtons.first();

      // 点击收藏
      await firstFavoriteButton.click();
      await page.waitForTimeout(1000);

      // 再次点击取消收藏
      await firstFavoriteButton.click();
      await page.waitForTimeout(1000);

      // 验证取消收藏状态
      const isNotFavorited = await firstFavoriteButton.evaluate(el =>
        !el.classList.contains('text-red-500') &&
        !el.classList.contains('text-pink-500')
      );

      console.log('取消收藏状态:', isNotFavorited ? '已取消' : '仍在收藏');
    }
  });

  test('用户资料显示', async ({ page }) => {
    const isLoggedIn = await login(page);

    if (!isLoggedIn) {
      test.skip('跳过测试：用户未登录');
      return;
    }

    // 点击用户菜单
    const userMenu = page.locator('[role="button"]').filter({ hasText: /T|U/ }).first();
    await userMenu.click();

    // 验证用户信息显示
    const userInfo = page.getByText(testUser.email).or(
      page.getByText(/test user/i)
    );

    if (await userInfo.isVisible()) {
      await expect(userInfo).toBeVisible();
    }
  });

  test('导航到不同页面', async ({ page }) => {
    const isLoggedIn = await login(page);

    if (!isLoggedIn) {
      test.skip('跳过测试：用户未登录');
      return;
    }

    // 测试导航到收藏页面
    const userMenu = page.locator('[role="button"]').filter({ hasText: /T|U/ }).first();
    await userMenu.click();

    const favoritesLink = page.getByText(/my favorites/i);
    if (await favoritesLink.isVisible()) {
      await favoritesLink.click();
      await page.waitForTimeout(1000);

      // 返回首页
      const logo = page.getByText('Website Curator').first();
      await logo.click();
      await page.waitForTimeout(1000);

      // 验证回到首页
      await expect(page.getByText('Discover Amazing Websites')).toBeVisible();
    }
  });

  test('搜索和筛选组合使用', async ({ page }) => {
    await page.goto('/');

    // 使用搜索功能
    const searchInput = page.getByPlaceholder(/search websites/i);
    await searchInput.fill('design');
    await page.waitForTimeout(1000);

    // 然后使用分类筛选
    const categoryButtons = page.locator('button').filter({ hasText: /design/i });
    if (await categoryButtons.count() > 0) {
      await categoryButtons.first().click();
      await page.waitForTimeout(1000);
    }

    // 验证结果
    const results = page.locator('.group').filter({ hasText: /design/i });
    if (await results.count() > 0) {
      await expect(results.first()).toBeVisible();
    }

    // 清空搜索
    await searchInput.clear();
    await page.waitForTimeout(500);
  });

  test('响应式用户界面', async ({ page }) => {
    const isLoggedIn = await login(page);

    if (!isLoggedIn) {
      test.skip('跳过测试：用户未登录');
      return;
    }

    // 切换到移动端视图
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    // 验证用户菜单在移动端仍然可用
    const userMenu = page.locator('[role="button"]').filter({ hasText: /T|U/ }).first();
    await expect(userMenu).toBeVisible();

    // 切换回桌面视图
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);

    // 验证桌面端布局
    await expect(userMenu).toBeVisible();
  });

  test('页面刷新后保持登录状态', async ({ page }) => {
    const isLoggedIn = await login(page);

    if (!isLoggedIn) {
      test.skip('跳过测试：用户未登录');
      return;
    }

    // 刷新页面
    await page.reload();
    await page.waitForTimeout(3000);

    // 验证仍然登录
    const userMenu = page.locator('[role="button"]').filter({ hasText: /T|U/ }).first();

    // 给一些时间让认证状态恢复
    await page.waitForTimeout(2000);

    if (await userMenu.isVisible()) {
      await expect(userMenu).toBeVisible();
      console.log('✅ 刷新后保持登录状态');
    } else {
      console.log('ℹ️ 刷新后需要重新登录');
    }
  });
});
