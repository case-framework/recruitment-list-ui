import { create } from 'zustand'

interface ScrollState {
    participantViewScrollPositions: Record<string, string | null>
    setParticipantViewScrollPosition: (recruitmentListId: string, participantId: string | null) => void
    getParticipantViewScrollPosition: (recruitmentListId: string) => string | null
    clearParticipantViewScrollPosition: (recruitmentListId: string) => void
}

export const useScrollStore = create<ScrollState>((set, get) => ({
    participantViewScrollPositions: {},
    setParticipantViewScrollPosition: (recruitmentListId, participantId) =>
        set((state) => ({
            participantViewScrollPositions: {
                ...state.participantViewScrollPositions,
                [recruitmentListId]: participantId
            }
        })),
    getParticipantViewScrollPosition: (recruitmentListId) => {
        const state = get()
        return state.participantViewScrollPositions[recruitmentListId] || null
    },
    clearParticipantViewScrollPosition: (recruitmentListId) =>
        set((state) => ({
            participantViewScrollPositions: {
                ...state.participantViewScrollPositions,
                [recruitmentListId]: null
            }
        })),
}))