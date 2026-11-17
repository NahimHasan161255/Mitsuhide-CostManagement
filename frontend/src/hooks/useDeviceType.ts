import { useState, useEffect } from 'react';

export type DeviceTier = 'desktop' | 'tablet' | 'mobile';

export interface DeviceInfo {
  isMobile: boolean;    // < 768px (Phone / Smart device)
  isTablet: boolean;    // 768px - 1199px (iPad, Android Tablet)
  isDesktop: boolean;   // >= 1200px (Laptop, Desktop, Wide screen)
  tier: DeviceTier;
  screenWidth: number;
}

/**
 * Enterprise Responsive Device Hook
 * Automatically categorizes the current viewport into Desktop, Tablet, or Mobile
 * with instant real-time listener and Ant Design breakpoint integration.
 */
export const useDeviceType = (): DeviceInfo => {
  const [width, setWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1200;
  const isDesktop = width >= 1200;

  const tier: DeviceTier = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

  return {
    isMobile,
    isTablet,
    isDesktop,
    tier,
    screenWidth: width,
  };
};
