export interface Pitch {
    id: string
    created_at: string
    problem: string
    solution: string
    video_url: string
    industry: string
    stage: string
    user_id: string
    upvotes: number
    comments: number
    has_voted: boolean
    thumbnail_url?: string | null
    profiles: {
        name: string
        avatar_url: string | null
        bio: string | null
    }
}
