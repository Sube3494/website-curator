"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { supabase, db, type SystemSetting } from "@/lib/supabase"

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
        const { data: settings, error } = await supabase
          .from('system_settings')
          .select('*');
        
        if (error) {
          throw error;
        }

        // 处理设置数据
        const settingsObj: Record<string, any> = { ...defaultSettings };
        settings.forEach((setting: SystemSetting) => {
          settingsObj[setting.key] = setting.value;
        });

        setSettings(settingsObj);
      } catch (error) {
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
      await db.updateSystemSetting(key, value);
    } catch (error) {
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