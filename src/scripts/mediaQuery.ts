export const aspectQuery = window.matchMedia('(min-aspect-ratio: 750/1000)')
export const isPc = () => aspectQuery.matches
