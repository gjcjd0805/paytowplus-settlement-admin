export interface INotice {
  id: string
  title: string
  content: string
  author: string
  createdAt: string
  views: number
  isImportant: boolean
}

export interface INoticeFormData {
  title: string
  content: string
  isImportant: boolean
}