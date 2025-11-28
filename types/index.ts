export interface IUser {
  companyId?: number
  loginId?: string // 로그인 ID
  name?: string // 업체명 또는 가맹점명
  level?: number // 레벨 (0: 본사, 1: 지사, 2: 총판, 3: 대리점)
  levelName?: string // 레벨명 (본사, 지사, 총판, 대리점)
  centerId?: number // 센터 ID
}

export type UserLevel = "본사" | "지사" | "총판" | "대리점"

export interface IMenuItem {
  title: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
  children?: IMenuItem[]
  levels: number[] // 허용되는 레벨 (0: 본사, 1: 지사, 2: 총판, 3: 대리점)
}