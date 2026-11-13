export interface Kojijyu {
  unqId?: number;
  kojiCd: number;
  kojiSyu: number;
  kojiNm?: string;
  kojiRyk?: string;
  kojiKana?: string;
  sekkei?: string;
  jyuCd: number;
  jyuNm?: string;

  keiyakuGnk: number;
  keiyakuGkm: number;

  keiyaku0Dt: number;
  keiyaku0Rt: number;
  keiyaku0Nk: number;
  keiyaku0Km: number;

  keiyaku1Dt?: number;
  keiyaku1Rt?: number;
  keiyaku1Nk?: number;
  keiyaku1Km?: number;

  keiyaku2Dt?: number;
  keiyaku2Rt?: number;
  keiyaku2Nk?: number;
  keiyaku2Km?: number;

  keiyaku3Dt?: number;
  keiyaku3Rt?: number;
  keiyaku3Nk?: number;
  keiyaku3Km?: number;

  yosangaku: number;
  yoteiArari: number;
  yoteiArariRate: number;

  koukiBgn: number;
  koukiEnd: number;
  basyo?: string;
  jimusho?: string;
  eigyoCd?: string;
  genbaCd?: string;
  jyuryo: number;
  koumin: number;
  keitai: number;
  kanseiKb: number;
  kanseiDt?: number;
  endNyukin?: number;
  horyuFg: number;
  biko1?: string;
  biko2?: string;
  kojiBiko1?: string;
  kojiBiko2?: string;
}
