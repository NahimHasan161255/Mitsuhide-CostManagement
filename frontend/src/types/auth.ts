export interface AuthUser {
  userCd: string;
  userName: string;
  userNameR?: string;
  userNameK?: string;
  tantoKbn: number;
  tantoKbnNm: string;
  userGrpCd?: string;
  userGrpNm?: string;
  syubetu: number;
  syubetuNm: string;
  loginDate?: string;
  passUpdDate?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
  token?: string;
}
