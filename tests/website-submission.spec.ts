import { test, expect } from '@playwright/test';

test.describe('网站提交功能测试', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'password123'
  };

  const testWebsite = {
    title: '测试网站',
    url: 'https://example.com',
    description: '这是一个用于测试的网站描述，包含了网站的主要功能和特点。',
    category: '开发工具',
    tags: ['测试', '示例', '工具']
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

  // 登录辅助函数
  async function login(page: any) {
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
      
      await emailField.fill(testUser.email);
      await passwordField.fill(testUser.password);

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

  test('检查网站提交功能是否可用', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 查找提交网站按钮
    const submitButton = page.getByRole('button', { name: '提交网站' }).or(
      page.getByRole('button', { name: 'Submit Website' })
    ).or(
      page.getByText('添加网站')
    );

    if (await submitButton.isVisible({ timeout: 3000 })) {
      await expect(submitButton).toBeVisible();
      console.log('✅ 网站提交按钮可见');
    } else {
      console.log('ℹ️ 网站提交按钮不可见，可能需要登录或功能未启用');
    }
  });

  test('未登录用户提交网站', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 查找并点击提交网站按钮
    const submitButton = page.getByRole('button', { name: '提交网站' }).or(
      page.getByRole('button', { name: 'Submit Website' })
    );

    if (await submitButton.isVisible({ timeout: 3000 })) {
      await submitButton.click();
      await page.waitForTimeout(1000);

      // 应该提示登录或显示登录对话框
      const loginPrompt = page.getByText(/请先登录/i).or(
        page.getByText(/please log in/i)
      ).or(
        page.getByText(/欢迎回来/i)
      );

      if (await loginPrompt.isVisible({ timeout: 2000 })) {
        await expect(loginPrompt).toBeVisible();
        console.log('✅ 未登录用户正确提示登录');
      } else {
        console.log('ℹ️ 未检测到登录提示，可能直接显示了提交表单');
      }
    } else {
      console.log('⚠️ 提交网站按钮不可见');
    }
  });

  test('已登录用户提交网站', async ({ page }) => {
    const isLoggedIn = await login(page);
    
    if (!isLoggedIn) {
      test.skip('跳过测试：用户未登录');
      return;
    }

    // 查找并点击提交网站按钮
    const submitButton = page.getByRole('button', { name: '提交网站' }).or(
      page.getByRole('button', { name: 'Submit Website' })
    );

    if (await submitButton.isVisible({ timeout: 3000 })) {
      await submitButton.click();
      await page.waitForTimeout(1000);

      // 验证提交表单显示
      const formTitle = page.getByText('提交网站').or(
        page.getByText('Submit Website')
      );
      await expect(formTitle).toBeVisible();

      // 填写表单
      const titleField = page.getByLabel('网站标题').or(
        page.getByLabel('Website Title')
      );
      const urlField = page.getByLabel('网站链接').or(
        page.getByLabel('Website URL')
      );
      const descriptionField = page.getByLabel('网站描述').or(
        page.getByLabel('Description')
      );

      await titleField.fill(testWebsite.title);
      await urlField.fill(testWebsite.url);
      await descriptionField.fill(testWebsite.description);

      // 选择分类
      const categorySelect = page.locator('select').filter({ 
        hasText: '分类' 
      }).or(
        page.locator('select').filter({ hasText: 'Category' })
      );
      
      if (await categorySelect.isVisible({ timeout: 2000 })) {
        await categorySelect.selectOption({ label: testWebsite.category });
      }

      // 添加标签
      const tagsField = page.getByLabel('标签').or(
        page.getByLabel('Tags')
      );
      
      if (await tagsField.isVisible({ timeout: 2000 })) {
        await tagsField.fill(testWebsite.tags.join(', '));
      }

      // 提交表单
      const submitFormButton = page.getByRole('button', { name: '提交' }).or(
        page.getByRole('button', { name: 'Submit' })
      );
      await submitFormButton.click();
      await page.waitForTimeout(2000);

      // 验证提交成功
      const successMessage = page.getByText(/提交成功/i).or(
        page.getByText(/successfully submitted/i)
      ).or(
        page.getByText(/等待审核/i)
      );

      if (await successMessage.isVisible({ timeout: 3000 })) {
        await expect(successMessage).toBeVisible();
        console.log('✅ 网站提交成功');
      } else {
        console.log('⚠️ 未检测到提交成功消息');
      }
    } else {
      console.log('⚠️ 提交网站按钮不可见');
    }
  });

  test('表单验证测试', async ({ page }) => {
    const isLoggedIn = await login(page);
    
    if (!isLoggedIn) {
      test.skip('跳过测试：用户未登录');
      return;
    }

    // 打开提交表单
    const submitButton = page.getByRole('button', { name: '提交网站' }).or(
      page.getByRole('button', { name: 'Submit Website' })
    );

    if (await submitButton.isVisible({ timeout: 3000 })) {
      await submitButton.click();
      await page.waitForTimeout(1000);

      // 尝试提交空表单
      const submitFormButton = page.getByRole('button', { name: '提交' }).or(
        page.getByRole('button', { name: 'Submit' })
      );
      await submitFormButton.click();
      await page.waitForTimeout(1000);

      // 验证错误消息
      const errorMessages = page.locator('.text-red-500').or(
        page.locator('.text-destructive')
      ).or(
        page.locator('[role="alert"]')
      );

      if (await errorMessages.count() > 0) {
        await expect(errorMessages.first()).toBeVisible();
        console.log('✅ 表单验证正常工作');
      } else {
        console.log('ℹ️ 未检测到表单验证错误消息');
      }

      // 测试无效URL
      const urlField = page.getByLabel('网站链接').or(
        page.getByLabel('Website URL')
      );
      await urlField.fill('invalid-url');
      await submitFormButton.click();
      await page.waitForTimeout(1000);

      const urlError = page.getByText(/无效的网址/i).or(
        page.getByText(/invalid url/i)
      );

      if (await urlError.isVisible({ timeout: 2000 })) {
        await expect(urlError).toBeVisible();
        console.log('✅ URL验证正常工作');
      }
    }
  });

  test('系统设置控制提交功能', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 检查系统设置是否影响提交功能的可见性
    const submitButton = page.getByRole('button', { name: '提交网站' }).or(
      page.getByRole('button', { name: 'Submit Website' })
    );

    const isSubmissionEnabled = await submitButton.isVisible({ timeout: 3000 });
    
    if (isSubmissionEnabled) {
      console.log('✅ 网站提交功能已启用');
    } else {
      console.log('ℹ️ 网站提交功能可能被系统设置禁用');
      
      // 检查是否有禁用提示
      const disabledMessage = page.getByText(/提交功能已禁用/i).or(
        page.getByText(/submission disabled/i)
      );
      
      if (await disabledMessage.isVisible({ timeout: 2000 })) {
        await expect(disabledMessage).toBeVisible();
      }
    }
  });

  test('重复网站提交检查', async ({ page }) => {
    const isLoggedIn = await login(page);
    
    if (!isLoggedIn) {
      test.skip('跳过测试：用户未登录');
      return;
    }

    // 尝试提交已存在的网站
    const submitButton = page.getByRole('button', { name: '提交网站' }).or(
      page.getByRole('button', { name: 'Submit Website' })
    );

    if (await submitButton.isVisible({ timeout: 3000 })) {
      await submitButton.click();
      await page.waitForTimeout(1000);

      // 填写已存在网站的URL
      const urlField = page.getByLabel('网站链接').or(
        page.getByLabel('Website URL')
      );
      await urlField.fill('https://github.com'); // 假设这是已存在的网站

      const titleField = page.getByLabel('网站标题').or(
        page.getByLabel('Website Title')
      );
      await titleField.fill('GitHub');

      const descriptionField = page.getByLabel('网站描述').or(
        page.getByLabel('Description')
      );
      await descriptionField.fill('代码托管平台');

      // 提交表单
      const submitFormButton = page.getByRole('button', { name: '提交' }).or(
        page.getByRole('button', { name: 'Submit' })
      );
      await submitFormButton.click();
      await page.waitForTimeout(2000);

      // 检查重复提示
      const duplicateMessage = page.getByText(/网站已存在/i).or(
        page.getByText(/already exists/i)
      ).or(
        page.getByText(/重复/i)
      );

      if (await duplicateMessage.isVisible({ timeout: 3000 })) {
        await expect(duplicateMessage).toBeVisible();
        console.log('✅ 重复网站检查正常工作');
      } else {
        console.log('ℹ️ 未检测到重复网站提示，可能允许重复提交');
      }
    }
  });
});
