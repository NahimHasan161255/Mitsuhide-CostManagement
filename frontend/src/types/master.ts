export interface Jyucyu {
  code: number;
  name: string;
  ryaku?: string;
  kana?: string;
  sekinin?: string;
  yubin?: string;
  jyusyo1?: string;
  jyusyo2?: string;
  tel?: string;
  fax?: string;
  mail?: string;
  simeDd: number;
  syukinMm: number;
  syukinDd: number;
  kaisyu?: string;
  tegata: number;
  genkin: number;
  kakeRt: number;
  syosiki: number;
  toriKb: number;
  biko1?: string;
  biko2?: string;
  biko3?: string;
}

export interface Siire {
  code: number;
  name: string;
  ryaku?: string;
  kana?: string;
  sekinin?: string;
  gyousyu?: string;
  yubin?: string;
  jyusyo1?: string;
  jyusyo2?: string;
  tel?: string;
  fax?: string;
  mail?: string;
  simeDd: number;
  siharai?: string;
  risoku: number;
  bnkNm?: string;
  stnNm?: string;
  kozaSb: number;
  kozaNo?: string;
  kozaNm?: string;
  biko1?: string;
  biko2?: string;
  biko3?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
