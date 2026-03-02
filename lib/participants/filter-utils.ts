export type ParticipantInfoFilters = Record<string, string>

type ParamsWithEntries = {
    entries: () => IterableIterator<[string, string]>
}

type SearchParamValue = string | string[] | undefined

const INFO_FILTER_PATTERN = /^infos\[(.+)\]$/

const normalizeSearchParamValue = (value: SearchParamValue) => {
    if (Array.isArray(value)) {
        return value[0] || ''
    }

    return value || ''
}

export const parseParticipantInfoFiltersFromEntries = (params: ParamsWithEntries): ParticipantInfoFilters => {
    const infoFilters: ParticipantInfoFilters = {}
    for (const [key, value] of params.entries()) {
        const match = key.match(INFO_FILTER_PATTERN)
        if (!match || !match[1]) {
            continue
        }

        infoFilters[match[1]] = value
    }

    return infoFilters
}

export const parseParticipantInfoFiltersFromObject = (searchParams: Record<string, SearchParamValue>) => {
    const infoFilters: ParticipantInfoFilters = {}
    for (const [key, value] of Object.entries(searchParams)) {
        const match = key.match(INFO_FILTER_PATTERN)
        if (!match || !match[1]) {
            continue
        }

        infoFilters[match[1]] = normalizeSearchParamValue(value)
    }

    return infoFilters
}

export const replaceParticipantInfoFiltersInQuery = (
    params: URLSearchParams,
    infoFilters: ParticipantInfoFilters,
) => {
    const keysToDelete: string[] = []
    for (const key of params.keys()) {
        if (INFO_FILTER_PATTERN.test(key)) {
            keysToDelete.push(key)
        }
    }

    for (const key of keysToDelete) {
        params.delete(key)
    }

    for (const [key, value] of Object.entries(infoFilters)) {
        params.set(`infos[${key}]`, value)
    }
}

export const areParticipantInfoFiltersEqual = (
    left: ParticipantInfoFilters,
    right: ParticipantInfoFilters,
) => {
    const leftEntries = Object.entries(left)
    const rightEntries = Object.entries(right)

    if (leftEntries.length !== rightEntries.length) {
        return false
    }

    for (const [key, value] of leftEntries) {
        if (right[key] !== value) {
            return false
        }
    }

    return true
}
