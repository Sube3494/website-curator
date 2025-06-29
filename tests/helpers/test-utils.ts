import { Page, expect } from '@playwright/test';

/**
 * 测试辅助工具类
 */
export class TestUtils {
  constructor(private page: Page) {}

  /**
   * 通用登录函数
   */
  async login(email: string = 'test@example.com', password: string = 'password123'): Promise<boolean> {
    try {
      await this.page.goto('/');
      await this.page.waitForLoadState('networkidle');

      // 检查是否已经登录
      const userAvatar = this.page.locator('header').locator('[role="button"]').filter({
        has: this.page.locator('div').filter({ hasText: /^[A-Z]$/ })
      });

      if (await userAvatar.isVisible({ timeout: 2000 })) {
        console.log('用户已登录');
        return true;
      }

      // 点击登录按钮
      const signInButton = this.page.locator('header').getByRole('button', { name: '登录' }).or(
        this.page.locator('header').getByRole('button', { name: 'Sign In' })
      );

      if (await signInButton.isVisible({ timeout: 3000 })) {
        await signInButton.click();
        await this.page.waitForTimeout(1000);

        // 填写登录表单
        const emailField = this.page.getByLabel('邮箱地址').or(this.page.getByLabel('Email Address'));
        const passwordField = this.page.getByLabel('密码').or(this.page.getByLabel('Password'));
        
        await emailField.fill(email);
        await passwordField.fill(password);

        // 提交表单
        const submitButton = this.page.getByRole('button', { name: '登录' }).or(
          this.page.getByRole('button', { name: 'Sign In' })
        ).filter({ hasNotText: '登录以保存收藏' });
        
        await submitButton.click();
        await this.page.waitForTimeout(3000);

        // 验证登录成功
        return await userAvatar.isVisible({ timeout: 3000 });
      }
      
      return false;
    } catch (error) {
      console.log('登录过程出错:', error);
      return false;
    }
  }

  /**
   * 管理员登录
   */
  async loginAsAdmin(userType: 'admin' | 'superadmin' = 'admin'): Promise<boolean> {
    const credentials = {
      admin: { email: 'admin@example.com', password: 'admin123' },
      superadmin: { email: 'superadmin@example.com', password: 'superadmin123' }
    };

    return await this.login(credentials[userType].email, credentials[userType].password);
  }

  /**
   * 登出
   */
  async logout(): Promise<void> {
    const userAvatar = this.page.locator('header').locator('[role="button"]').filter({
      has: this.page.locator('div').filter({ hasText: /^[A-Z]$/ })
    });

    if (await userAvatar.isVisible({ timeout: 2000 })) {
      await userAvatar.click();
      await this.page.waitForTimeout(500);

      const signOutButton = this.page.getByText('退出登录').or(
        this.page.getByText('Sign Out')
      );
      
      if (await signOutButton.isVisible({ timeout: 2000 })) {
        await signOutButton.click();
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * 等待网站列表加载
   */
  async waitForWebsiteList(): Promise<void> {
    await this.page.waitForSelector('.grid', { timeout: 15000 });
    
    // 等待至少一个网站卡片出现
    const websiteCards = this.page.locator('.grid > div').filter({
      has: this.page.locator('.font-semibold')
    });
    
    await expect(websiteCards.first()).toBeVisible({ timeout: 10000 });
  }

  /**
   * 获取网站卡片数量
   */
  async getWebsiteCardCount(): Promise<number> {
    const websiteCards = this.page.locator('.grid > div').filter({
      has: this.page.locator('.font-semibold')
    });
    
    return await websiteCards.count();
  }

  /**
   * 搜索网站
   */
  async searchWebsites(query: string): Promise<void> {
    const searchBox = this.page.getByPlaceholder('搜索网站... (Ctrl+K)').or(
      this.page.getByPlaceholder('Search websites... (Ctrl+K)')
    );
    
    await searchBox.fill(query);
    await this.page.waitForTimeout(1500);
  }

  /**
   * 清除搜索
   */
  async clearSearch(): Promise<void> {
    const searchBox = this.page.getByPlaceholder('搜索网站... (Ctrl+K)').or(
      this.page.getByPlaceholder('Search websites... (Ctrl+K)')
    );
    
    await searchBox.clear();
    await this.page.waitForTimeout(500);
  }

  /**
   * 选择分类
   */
  async selectCategory(categoryName: string): Promise<void> {
    const categoryButton = this.page.locator('aside').getByRole('button', { name: categoryName });
    
    if (await categoryButton.isVisible({ timeout: 3000 })) {
      await categoryButton.click();
      await this.page.waitForTimeout(1500);
    }
  }

  /**
   * 点击收藏按钮
   */
  async toggleFavorite(index: number = 0): Promise<void> {
    const favoriteButtons = this.page.locator('button').filter({
      has: this.page.locator('svg[data-lucide="heart"]')
    });
    
    if (await favoriteButtons.count() > index) {
      await favoriteButtons.nth(index).click();
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * 导航到管理页面
   */
  async navigateToAdminPage(pageName: string): Promise<boolean> {
    const userAvatar = this.page.locator('header').locator('[role="button"]').filter({
      has: this.page.locator('div').filter({ hasText: /^[A-Z]$/ })
    });

    if (await userAvatar.isVisible({ timeout: 3000 })) {
      await userAvatar.click();
      await this.page.waitForTimeout(500);

      const adminLink = this.page.getByText(pageName);
      
      if (await adminLink.isVisible({ timeout: 2000 })) {
        await adminLink.click();
        await this.page.waitForTimeout(2000);
        return true;
      }
    }
    
    return false;
  }

  /**
   * 检查Toast消息
   */
  async checkToastMessage(expectedText?: string): Promise<string | null> {
    const toastMessage = this.page.locator('.sonner-toast').or(
      this.page.locator('[data-sonner-toast]')
    );

    if (await toastMessage.isVisible({ timeout: 3000 })) {
      const text = await toastMessage.textContent();
      
      if (expectedText) {
        expect(text).toContain(expectedText);
      }
      
      return text;
    }
    
    return null;
  }

  /**
   * 等待加载完成
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);
  }

  /**
   * 检查错误消息
   */
  async checkErrorMessage(): Promise<string | null> {
    const errorSelectors = [
      '.text-red-500',
      '.text-destructive',
      '[role="alert"]',
      '.error-message'
    ];

    for (const selector of errorSelectors) {
      const errorElement = this.page.locator(selector);
      
      if (await errorElement.isVisible({ timeout: 2000 })) {
        return await errorElement.textContent();
      }
    }
    
    return null;
  }

  /**
   * 填写网站提交表单
   */
  async fillWebsiteSubmissionForm(data: {
    title: string;
    url: string;
    description: string;
    category?: string;
    tags?: string[];
  }): Promise<void> {
    // 填写标题
    const titleField = this.page.getByLabel('网站标题').or(
      this.page.getByLabel('Website Title')
    );
    await titleField.fill(data.title);

    // 填写URL
    const urlField = this.page.getByLabel('网站链接').or(
      this.page.getByLabel('Website URL')
    );
    await urlField.fill(data.url);

    // 填写描述
    const descriptionField = this.page.getByLabel('网站描述').or(
      this.page.getByLabel('Description')
    );
    await descriptionField.fill(data.description);

    // 选择分类
    if (data.category) {
      const categorySelect = this.page.locator('select').filter({ 
        hasText: '分类' 
      }).or(
        this.page.locator('select').filter({ hasText: 'Category' })
      );
      
      if (await categorySelect.isVisible({ timeout: 2000 })) {
        await categorySelect.selectOption({ label: data.category });
      }
    }

    // 添加标签
    if (data.tags && data.tags.length > 0) {
      const tagsField = this.page.getByLabel('标签').or(
        this.page.getByLabel('Tags')
      );
      
      if (await tagsField.isVisible({ timeout: 2000 })) {
        await tagsField.fill(data.tags.join(', '));
      }
    }
  }

  /**
   * 提交表单
   */
  async submitForm(): Promise<void> {
    const submitButton = this.page.getByRole('button', { name: '提交' }).or(
      this.page.getByRole('button', { name: 'Submit' })
    );
    
    await submitButton.click();
    await this.page.waitForTimeout(2000);
  }
}

/**
 * 创建测试工具实例
 */
export function createTestUtils(page: Page): TestUtils {
  return new TestUtils(page);
}
