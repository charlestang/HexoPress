export type Post = {
    title: string
    date: string
    source: string
}
export interface ISite {
    getPosts: () => Promise<Post[]>,
}
    
declare global {
    interface Window {
        site: ISite
    }
}