export interface CurrentUser {
  id: number;
  username: string;
  merchantId: number;
  realName?: string;
  email?: string;
}

export interface UpdateBrandDto {
  name?: string;
  description?: string;
  logo?: string;
  iconUrl?: string;
  status?: boolean;
  isAuth?: boolean;
  isHot?: boolean;
  label?: string[];
}

export interface BrandQueryDto {
  page?: number;
  limit?: number;
  name?: string;
  status?: boolean;
  isAuth?: boolean;
  isHot?: boolean;
}

export interface BatchUpdateDto {
  ids: number[];
  status: boolean;
}

export interface BatchAuthDto {
  ids: number[];
  isAuth: boolean;
}
