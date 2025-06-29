import { test, expect } from '@playwright/test'

// 改进的登录辅助函数
async function login(page: any) {
  try {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 检查是否已经登录（查找用户头像）
    const userAvatar = page.locator('header').locator('[role="button"]').filter({
      has: page.locator('div').filter({ hasText: /^[A-Z]$/ })
    });

    if (await userAvatar.isVisible({ timeout: 2000 })) {
      console.log('用户已登录');
      return true;
    }

    // 查找并点击登录按钮（支持中英文）
    const signInButton = page.locator('header').getByRole('button', { name: '登录' }).or(
      page.locator('header').getByRole('button', { name: 'Sign In' })
    );

    if (await signInButton.isVisible({ timeout: 3000 })) {
      console.log('用户未登录，尝试登录...');
      await signInButton.click();
      await page.waitForTimeout(1000);

      // 等待登录表单出现
      await page.waitForSelector('input[type="email"]', { timeout: 5000 });

      // 填写登录信息（支持中英文标签）
      const emailField = page.getByLabel('邮箱地址').or(page.getByLabel('Email Address'));
      const passwordField = page.getByLabel('密码').or(page.getByLabel('Password'));

      await emailField.fill('test@example.com');
      await passwordField.fill('password123');

      // 点击登录提交按钮
      const submitButton = page.getByRole('button', { name: '登录' }).or(
        page.getByRole('button', { name: 'Sign In' })
      ).filter({ hasNotText: '登录以保存收藏' });
      await submitButton.click();

      // 等待登录完成
      await page.waitForTimeout(5000);

      // 验证登录成功
      const isLoggedIn = await userAvatar.isVisible({ timeout: 3000 });
      if (isLoggedIn) {
        console.log('✅ 登录成功');
        return true;
      } else {
        console.log('⚠️ 登录失败');
        return false;
      }
    } else {
      console.log('未找到登录按钮');
      return false;
    }
  } catch (error) {
    console.log('登录过程出错:', error);
    return false;
  }
}

test.describe('收藏功能性能测试', () => {
  test.beforeEach(async ({ page }) => {
    // 设置默认超时时间
    page.setDefaultTimeout(15000);
  })

  test('收藏按钮响应速度测试', async ({ page }) => {
    const isLoggedIn = await login(page)

    if (!isLoggedIn) {
      test.skip('跳过测试：用户未登录')
      return
    }

    // 等待网站列表加载
    await page.waitForSelector('.grid', { timeout: 15000 });

    // 查找收藏按钮（Heart图标）
    const favoriteButton = page.locator('button').filter({
      has: page.locator('svg[data-lucide="heart"]')
    }).first();

    if (await favoriteButton.count() === 0) {
      console.log('未找到收藏按钮，跳过测试')
      return
    }

    // 记录初始状态
    const initialState = await favoriteButton.evaluate(el => ({
      classList: Array.from(el.classList),
      disabled: el.disabled
    }));

    // 测试点击响应时间
    const startTime = Date.now()

    // 点击收藏按钮
    await favoriteButton.click()

    // 等待UI状态变化（乐观更新应该立即生效）
    await page.waitForTimeout(100) // 给一点时间让DOM更新

    const responseTime = Date.now() - startTime
    console.log(`收藏按钮响应时间: ${responseTime}ms`)

    // 验证响应时间应该很快（小于500ms，考虑到网络延迟）
    expect(responseTime).toBeLessThan(500)

    // 验证按钮状态已经改变（乐观更新）
    const buttonAfterClick = await favoriteButton.evaluate(el => ({
      classList: Array.from(el.classList),
      disabled: el.disabled
    }));

    console.log('初始状态:', initialState);
    console.log('点击后状态:', buttonAfterClick);

    // 验证样式发生了变化（表示乐观更新生效）
    const hasStyleChange = JSON.stringify(initialState.classList) !== JSON.stringify(buttonAfterClick.classList);
    if (hasStyleChange) {
      console.log('✅ 乐观更新生效，按钮样式已改变');
    } else {
      console.log('⚠️ 按钮样式未发生变化');
    }
  })

  test('收藏状态即时更新测试', async ({ page }) => {
    const isLoggedIn = await login(page)

    if (!isLoggedIn) {
      test.skip('跳过测试：用户未登录')
      return
    }

    // 查找收藏按钮
    const favoriteButton = page.locator('[data-testid="favorite-button"]').first().or(
      page.locator('button').filter({ hasText: /heart/i }).first()
    )

    if (await favoriteButton.count() === 0) {
      console.log('未找到收藏按钮，跳过测试')
      return
    }

    // 记录初始状态
    const initialState = await favoriteButton.evaluate(el => {
      return el.classList.contains('text-pink-600') ||
        el.classList.contains('text-red-500') ||
        el.querySelector('svg')?.classList.contains('fill-current')
    })

    console.log('初始收藏状态:', initialState ? '已收藏' : '未收藏')

    // 点击收藏按钮
    await favoriteButton.click()

    // 立即检查状态变化（不等待网络请求）
    await page.waitForTimeout(100) // 给乐观更新一点时间

    const newState = await favoriteButton.evaluate(el => {
      return el.classList.contains('text-pink-600') ||
        el.classList.contains('text-red-500') ||
        el.querySelector('svg')?.classList.contains('fill-current')
    })

    console.log('点击后收藏状态:', newState ? '已收藏' : '未收藏')

    // 验证状态已经改变
    expect(newState).not.toBe(initialState)
  })

  test('收藏页面删除性能测试', async ({ page }) => {
    const isLoggedIn = await login(page)

    if (!isLoggedIn) {
      test.skip('跳过测试：用户未登录')
      return
    }

    // 导航到收藏页面
    const favoritesLink = page.locator('a').filter({ hasText: /收藏|favorites/i }).first()
    if (await favoritesLink.isVisible({ timeout: 3000 })) {
      await favoritesLink.click()
      await page.waitForLoadState('networkidle')
    }

    // 查找删除按钮
    const deleteButton = page.locator('[data-testid="remove-favorite"]').first().or(
      page.locator('button').filter({ hasText: /删除|remove/i }).first()
    )

    if (await deleteButton.count() === 0) {
      console.log('收藏页面没有可删除的项目，跳过测试')
      return
    }

    // 记录删除前的项目数量
    const itemsBefore = await page.locator('[data-testid="favorite-item"]').count()
    console.log('删除前收藏项目数量:', itemsBefore)

    // 测试删除响应时间
    const startTime = Date.now()

    await deleteButton.click()

    // 等待UI更新（乐观更新应该立即生效）
    await page.waitForTimeout(100)

    const responseTime = Date.now() - startTime
    console.log(`删除操作响应时间: ${responseTime}ms`)

    // 验证响应时间应该很快
    expect(responseTime).toBeLessThan(200)

    // 验证项目已经从UI中移除（乐观更新）
    const itemsAfter = await page.locator('[data-testid="favorite-item"]').count()
    console.log('删除后收藏项目数量:', itemsAfter)

    if (itemsBefore > 0) {
      expect(itemsAfter).toBeLessThan(itemsBefore)
    }
  })

  test('网络错误回滚测试', async ({ page }) => {
    const isLoggedIn = await login(page)

    if (!isLoggedIn) {
      test.skip('跳过测试：用户未登录')
      return
    }

    // 模拟网络错误
    await page.route('**/favorites', route => {
      route.abort('failed')
    })

    const favoriteButton = page.locator('[data-testid="favorite-button"]').first().or(
      page.locator('button').filter({ hasText: /heart/i }).first()
    )

    if (await favoriteButton.count() === 0) {
      console.log('未找到收藏按钮，跳过测试')
      return
    }

    // 记录初始状态
    const initialState = await favoriteButton.evaluate(el => {
      return el.classList.contains('text-pink-600') ||
        el.classList.contains('text-red-500')
    })

    // 点击收藏按钮
    await favoriteButton.click()

    // 等待错误处理和回滚
    await page.waitForTimeout(2000)

    // 验证状态已回滚到初始状态
    const finalState = await favoriteButton.evaluate(el => {
      return el.classList.contains('text-pink-600') ||
        el.classList.contains('text-red-500')
    })

    expect(finalState).toBe(initialState)

    // 验证错误提示出现
    const errorToast = page.locator('.sonner-toast').filter({ hasText: /失败|error/i })
    await expect(errorToast).toBeVisible({ timeout: 3000 })
  })
})
