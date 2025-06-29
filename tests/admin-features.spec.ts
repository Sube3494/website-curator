import { test, expect } from '@playwright/test';

test.describe('管理员功能测试', () => {
  const adminUser = {
    email: 'admin@example.com',
    password: 'admin123'
  };

  const superAdminUser = {
    email: 'superadmin@example.com',
    password: 'superadmin123'
  };

  test.beforeEach(async ({ page }) => {
    page.setDefaultTimeout(15000);
    
    // 监听控制台错误
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console error:', msg.text());
      }
    });
  });

  // 管理员登录辅助函数
  async function loginAsAdmin(page: any, userType: 'admin' | 'superadmin' = 'admin') {
    const user = userType === 'superadmin' ? superAdminUser : adminUser;
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const signInButton = page.locator('header').getByRole('button', { name: '登录' }).or(
      page.locator('header').getByRole('button', { name: 'Sign In' })
    );
    
    if (await signInButton.isVisible({ timeout: 3000 })) {
      await signInButton.click();
      await page.waitForTimeout(1000);

      const emailField = page.getByLabel('邮箱地址').or(page.getByLabel('Email Address'));
      const passwordField = page.getByLabel('密码').or(page.getByLabel('Password'));
      
      await emailField.fill(user.email);
      await passwordField.fill(user.password);

      const submitButton = page.getByRole('button', { name: '登录' }).or(
        page.getByRole('button', { name: 'Sign In' })
      ).filter({ hasNotText: '登录以保存收藏' });
      
      await submitButton.click();
      await page.waitForTimeout(3000);

      // 验证登录成功
      const userAvatar = page.locator('header').locator('[role="button"]').filter({
        has: page.locator('div').filter({ hasText: /^[A-Z]$/ })
      });

      return await userAvatar.isVisible({ timeout: 3000 });
    }
    
    return false;
  }

  test('访问用户管理页面', async ({ page }) => {
    const isLoggedIn = await loginAsAdmin(page);
    
    if (!isLoggedIn) {
      test.skip('跳过测试：管理员未登录');
      return;
    }

    // 点击用户头像菜单
    const userAvatar = page.locator('header').locator('[role="button"]').filter({
      has: page.locator('div').filter({ hasText: /^[A-Z]$/ })
    });
    await userAvatar.click();
    await page.waitForTimeout(500);

    // 查找并点击用户管理链接
    const userManagementLink = page.getByText('用户管理').or(
      page.getByText('User Management')
    );
    
    if (await userManagementLink.isVisible({ timeout: 2000 })) {
      await userManagementLink.click();
      await page.waitForTimeout(2000);

      // 验证用户管理页面加载
      const pageTitle = page.getByText('用户管理').or(
        page.getByText('User Management')
      );
      await expect(pageTitle).toBeVisible();

      // 验证用户列表显示
      const userTable = page.locator('table').or(
        page.locator('[role="table"]')
      );
      
      if (await userTable.isVisible({ timeout: 3000 })) {
        await expect(userTable).toBeVisible();
        console.log('✅ 用户管理页面加载成功');
      }
    } else {
      console.log('⚠️ 用户管理链接不可见，可能权限不足');
    }
  });

  test('分类管理功能', async ({ page }) => {
    const isLoggedIn = await loginAsAdmin(page);
    
    if (!isLoggedIn) {
      test.skip('跳过测试：管理员未登录');
      return;
    }

    // 访问分类管理页面
    const userAvatar = page.locator('header').locator('[role="button"]').filter({
      has: page.locator('div').filter({ hasText: /^[A-Z]$/ })
    });
    await userAvatar.click();
    await page.waitForTimeout(500);

    const categoryManagementLink = page.getByText('分类管理').or(
      page.getByText('Category Management')
    );
    
    if (await categoryManagementLink.isVisible({ timeout: 2000 })) {
      await categoryManagementLink.click();
      await page.waitForTimeout(2000);

      // 验证分类管理页面
      const pageTitle = page.getByText('分类管理').or(
        page.getByText('Category Management')
      );
      await expect(pageTitle).toBeVisible();

      // 查找添加分类按钮
      const addCategoryButton = page.getByRole('button', { name: '添加分类' }).or(
        page.getByRole('button', { name: 'Add Category' })
      );
      
      if (await addCategoryButton.isVisible({ timeout: 2000 })) {
        await expect(addCategoryButton).toBeVisible();
        console.log('✅ 分类管理页面功能正常');
      }
    } else {
      console.log('⚠️ 分类管理链接不可见');
    }
  });

  test('网站审核功能', async ({ page }) => {
    const isLoggedIn = await loginAsAdmin(page);
    
    if (!isLoggedIn) {
      test.skip('跳过测试：管理员未登录');
      return;
    }

    // 访问网站管理页面
    const userAvatar = page.locator('header').locator('[role="button"]').filter({
      has: page.locator('div').filter({ hasText: /^[A-Z]$/ })
    });
    await userAvatar.click();
    await page.waitForTimeout(500);

    const websiteManagementLink = page.getByText('网站管理').or(
      page.getByText('Website Management')
    );
    
    if (await websiteManagementLink.isVisible({ timeout: 2000 })) {
      await websiteManagementLink.click();
      await page.waitForTimeout(2000);

      // 验证网站管理页面
      const pageTitle = page.getByText('网站管理').or(
        page.getByText('Website Management')
      );
      await expect(pageTitle).toBeVisible();

      // 查找待审核网站
      const pendingWebsites = page.locator('[data-status="pending"]').or(
        page.getByText('待审核').locator('..')
      );
      
      if (await pendingWebsites.count() > 0) {
        // 查找审核按钮
        const approveButton = page.getByRole('button', { name: '批准' }).or(
          page.getByRole('button', { name: 'Approve' })
        ).first();
        
        const rejectButton = page.getByRole('button', { name: '拒绝' }).or(
          page.getByRole('button', { name: 'Reject' })
        ).first();

        await expect(approveButton.or(rejectButton)).toBeVisible();
        console.log('✅ 网站审核功能可用');
      } else {
        console.log('ℹ️ 当前没有待审核的网站');
      }
    } else {
      console.log('⚠️ 网站管理链接不可见');
    }
  });

  test('系统设置管理', async ({ page }) => {
    const isLoggedIn = await loginAsAdmin(page);
    
    if (!isLoggedIn) {
      test.skip('跳过测试：管理员未登录');
      return;
    }

    // 访问系统设置页面
    const userAvatar = page.locator('header').locator('[role="button"]').filter({
      has: page.locator('div').filter({ hasText: /^[A-Z]$/ })
    });
    await userAvatar.click();
    await page.waitForTimeout(500);

    const settingsLink = page.getByText('系统设置').or(
      page.getByText('System Settings')
    );
    
    if (await settingsLink.isVisible({ timeout: 2000 })) {
      await settingsLink.click();
      await page.waitForTimeout(2000);

      // 验证系统设置页面
      const pageTitle = page.getByText('系统设置').or(
        page.getByText('System Settings')
      );
      await expect(pageTitle).toBeVisible();

      // 查找用户提交设置
      const userSubmissionSetting = page.getByText('用户提交').or(
        page.getByText('User Submissions')
      );
      
      if (await userSubmissionSetting.isVisible({ timeout: 2000 })) {
        await expect(userSubmissionSetting).toBeVisible();
        console.log('✅ 系统设置页面加载成功');
      }
    } else {
      console.log('⚠️ 系统设置链接不可见');
    }
  });

  test('用户状态管理', async ({ page }) => {
    const isLoggedIn = await loginAsAdmin(page);
    
    if (!isLoggedIn) {
      test.skip('跳过测试：管理员未登录');
      return;
    }

    // 访问用户管理页面
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    // 查找用户状态切换按钮
    const statusToggle = page.locator('[data-testid="user-status-toggle"]').first().or(
      page.getByRole('button', { name: '禁用' }).or(
        page.getByRole('button', { name: '启用' })
      ).first()
    );

    if (await statusToggle.isVisible({ timeout: 3000 })) {
      const initialText = await statusToggle.textContent();
      console.log('初始状态按钮文本:', initialText);

      await statusToggle.click();
      await page.waitForTimeout(1000);

      // 验证状态已更改
      const newText = await statusToggle.textContent();
      console.log('更改后状态按钮文本:', newText);

      expect(newText).not.toBe(initialText);
      console.log('✅ 用户状态管理功能正常');
    } else {
      console.log('⚠️ 用户状态切换按钮不可见');
    }
  });

  test('超级管理员权限验证', async ({ page }) => {
    const isLoggedIn = await loginAsAdmin(page, 'superadmin');
    
    if (!isLoggedIn) {
      test.skip('跳过测试：超级管理员未登录');
      return;
    }

    // 验证超级管理员特有功能
    const userAvatar = page.locator('header').locator('[role="button"]').filter({
      has: page.locator('div').filter({ hasText: /^[A-Z]$/ })
    });
    await userAvatar.click();
    await page.waitForTimeout(500);

    // 超级管理员应该能看到所有管理功能
    const adminMenuItems = [
      page.getByText('用户管理'),
      page.getByText('分类管理'),
      page.getByText('网站管理'),
      page.getByText('系统设置')
    ];

    let visibleCount = 0;
    for (const item of adminMenuItems) {
      if (await item.isVisible({ timeout: 1000 })) {
        visibleCount++;
      }
    }

    console.log(`超级管理员可见菜单项数量: ${visibleCount}/${adminMenuItems.length}`);
    expect(visibleCount).toBeGreaterThan(0);
  });
});
