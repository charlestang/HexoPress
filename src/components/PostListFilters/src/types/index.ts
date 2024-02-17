export enum PostFilterType {
  StatusFilter = 'status',
  DateCategoryFilter = 'dateCategory',
  SearchFilter = 'search',
}

export enum PostStatusFilterChoice {
  All = 'all',
  Published = 'published',
  Draft = 'draft',
}

export type DateCategoryFilterValue = {
  date: string
  category: string
}
