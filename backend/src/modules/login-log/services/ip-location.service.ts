import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface IPLocationInfo {
  ip: string;
  country?: string;
  region?: string;
  city?: string;
  isp?: string;
  location?: string;
}

@Injectable()
export class IpLocationService {
  constructor(private configService: ConfigService) {}

  /**
   * 获取IP地址的地理位置信息
   * @param ip IP地址
   * @returns 位置信息
   */
  async getLocationInfo(ip: string): Promise<IPLocationInfo> {
    // 处理本地和私有IP
    if (this.isLocalOrPrivateIP(ip)) {
      return {
        ip,
        location: this.getLocalLocationName(ip),
      };
    }

    // 尝试使用多个免费的IP定位服务
    const locationInfo = await this.tryMultipleServices(ip);
    return {
      ip,
      ...locationInfo,
      location: this.formatLocation(locationInfo),
    };
  }

  /**
   * 尝试多个IP定位服务，提高成功率
   */
  private async tryMultipleServices(
    ip: string,
  ): Promise<Partial<IPLocationInfo>> {
    const services = [
      () => this.getLocationFromIpApi(ip),
      () => this.getLocationFromIpInfo(ip),
      () => this.getLocationFromFreeGeoIP(ip),
    ];

    for (const service of services) {
      try {
        const result = await service();
        if (result && (result.country || result.city)) {
          console.log(`✅ IP定位成功 (${ip}):`, result);
          return result;
        }
      } catch (error) {
        console.warn(`IP定位服务失败 (${ip}):`, error.message);
        continue;
      }
    }

    console.warn(`⚠️ 所有IP定位服务都失败了 (${ip})`);
    return { location: '外网' };
  }

  /**
   * 使用 ip-api.com 服务（免费，限制100次/分钟）
   */
  private async getLocationFromIpApi(
    ip: string,
  ): Promise<Partial<IPLocationInfo>> {
    try {
      const response = await axios.get(
        `http://ip-api.com/json/${ip}?lang=zh-CN`,
        {
          timeout: 3000,
        },
      );

      if (response.data.status === 'success') {
        return {
          country: response.data.country,
          region: response.data.regionName,
          city: response.data.city,
          isp: response.data.isp,
        };
      }
    } catch (error) {
      throw new Error(`ip-api.com请求失败: ${error.message}`);
    }
    return {};
  }

  /**
   * 使用 ipinfo.io 服务（免费，限制1000次/月）
   */
  private async getLocationFromIpInfo(
    ip: string,
  ): Promise<Partial<IPLocationInfo>> {
    try {
      const response = await axios.get(`https://ipinfo.io/${ip}/json`, {
        timeout: 3000,
      });

      if (response.data) {
        const data = response.data;
        return {
          country: data.country,
          region: data.region,
          city: data.city,
          isp: data.org,
        };
      }
    } catch (error) {
      throw new Error(`ipinfo.io请求失败: ${error.message}`);
    }
    return {};
  }

  /**
   * 使用 freegeoip.app 服务
   */
  private async getLocationFromFreeGeoIP(
    ip: string,
  ): Promise<Partial<IPLocationInfo>> {
    try {
      const response = await axios.get(`https://freegeoip.app/json/${ip}`, {
        timeout: 3000,
      });

      if (response.data) {
        const data = response.data;
        return {
          country: data.country_name,
          region: data.region_name,
          city: data.city,
          isp: null,
        };
      }
    } catch (error) {
      throw new Error(`freegeoip.app请求失败: ${error.message}`);
    }
    return {};
  }

  /**
   * 判断是否为本地或私有IP
   */
  private isLocalOrPrivateIP(ip: string): boolean {
    // 本地地址
    if (
      ip === '127.0.0.1' ||
      ip === 'localhost' ||
      ip === '::1' ||
      ip === '0:0:0:0:0:0:0:1'
    ) {
      return true;
    }

    // 处理空或无效IP
    if (!ip || ip === '-' || ip === 'unknown') {
      return true;
    }

    // IPv4私有地址
    if (this.isPrivateIPv4(ip)) {
      return true;
    }

    // IPv6私有地址
    if (this.isPrivateIPv6(ip)) {
      return true;
    }

    return false;
  }

  /**
   * 判断IPv4私有地址
   */
  private isPrivateIPv4(ip: string): boolean {
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = ip.match(ipv4Regex);

    if (!match) return false;

    const octets = match.slice(1, 5).map(Number);
    if (octets.some((octet) => octet > 255)) return false;

    return (
      octets[0] === 10 ||
      (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
      (octets[0] === 192 && octets[1] === 168) ||
      (octets[0] === 169 && octets[1] === 254)
    );
  }

  /**
   * 判断IPv6私有地址
   */
  private isPrivateIPv6(ip: string): boolean {
    if (!ip.includes(':')) return false;

    const normalized = ip.toLowerCase().replace(/^::ffff:/, '');

    return (
      normalized.startsWith('fc') ||
      normalized.startsWith('fd') ||
      normalized.startsWith('fe80:') ||
      normalized === '::1'
    );
  }

  /**
   * 获取本地IP的位置名称
   */
  private getLocalLocationName(ip: string): string {
    if (
      ip === '127.0.0.1' ||
      ip === 'localhost' ||
      ip === '::1' ||
      ip === '0:0:0:0:0:0:0:1'
    ) {
      return '本地';
    }

    if (!ip || ip === '-' || ip === 'unknown') {
      return '-';
    }

    if (this.isPrivateIPv4(ip)) {
      return '内网';
    }

    if (this.isPrivateIPv6(ip)) {
      return '内网IPv6';
    }

    return '未知';
  }

  /**
   * 格式化位置信息为简洁的字符串
   */
  private formatLocation(info: Partial<IPLocationInfo>): string {
    const parts: string[] = [];

    if (info.country) {
      // 将英文国家名转换为中文（简单映射）
      const countryMap: Record<string, string> = {
        China: '中国',
        'United States': '美国',
        Japan: '日本',
        'South Korea': '韩国',
        Singapore: '新加坡',
        'Hong Kong': '香港',
        Taiwan: '台湾',
        Macau: '澳门',
      };
      parts.push(countryMap[info.country] || info.country);
    }

    if (info.region && info.region !== info.country) {
      parts.push(info.region);
    }

    if (info.city && info.city !== info.region) {
      parts.push(info.city);
    }

    return parts.length > 0 ? parts.join('-') : '外网';
  }
}
