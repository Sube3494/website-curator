"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { type SystemSetting } from "@/lib/types"

const defaultSettings = {
  allow_registration: true,
  allow_website_submission: true,
  require_approval_for_websites: true,
  enable_favorites: true,
  enable_dark_mode: true,
  enable_animation: true,
  show_footer: true
};

interface SystemSettingsContextType {
  settings: Record<string, any>;
  updateSetting: (key: string, value: any) => Promise<void>;
  isLoading: boolean;
}

const SystemSettingsContext = createContext<SystemSettingsContextType | undefined>(undefined);

export function SystemSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Record<string, any>>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        // 通过API获取系统设置
        const response = await fetch('/api/system-settings', {
          credentials: 'include'
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // 处理设置数据
            const settingsObj: Record<string, any> = { ...defaultSettings };
            result.data.forEach((setting: any) => {
              try {
                // 解析 JSON 格式的设置值，支持新接口格式
                const key = setting.key || setting.setting_key;
                const value = setting.value || setting.setting_value;
                
                settingsObj[key] = typeof value === 'string' 
                  ? JSON.parse(value) 
                  : value;
              } catch (parseError) {
                // 如果解析失败，使用原始值
                const key = setting.key || setting.setting_key;
                const value = setting.value || setting.setting_value;
                settingsObj[key] = value;
              }
            });
            setSettings(settingsObj);
          } else {
            throw new Error(result.message || '获取系统设置失败');
          }
        } else {
          throw new Error('API请求失败');
        }
      } catch (error) {
        console.error('加载系统设置失败:', error);
        // 如果出错，使用默认设置
        setSettings(defaultSettings);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateSetting = async (key: string, value: any) => {
    try {
      // 本地立即更新
      setSettings(prev => ({
        ...prev,
        [key]: value
      }));
      
      // 发送到服务器
      console.log('正在更新设置:', { key, value })
      const response = await fetch('/api/system-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ key, value })
      });

      if (!response.ok) {
        const result = await response.json();
        console.error('服务器返回错误:', result);
        throw new Error(result.message || '更新设置失败');
      } else {
        console.log('设置更新成功');
      }
    } catch (error) {
      console.error('更新设置出错:', error);
      // 恢复原值
      setSettings(prev => ({
        ...prev,
        [key]: prev[key]
      }));
      throw error;
    }
  };

  return (
    <SystemSettingsContext.Provider value={{ settings, updateSetting, isLoading }}>
      {children}
    </SystemSettingsContext.Provider>
  );
}

export function useSystemSettings() {
  const context = useContext(SystemSettingsContext);
  if (context === undefined) {
    throw new Error("useSystemSettings must be used within a SystemSettingsProvider");
  }
  return context;
} 