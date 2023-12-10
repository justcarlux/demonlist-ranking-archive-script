import Nationality from "./Nationality"

export default interface RankedPlayer {
    id: number,
    name: string,
    rank: number,
    score: number
    nationality: Nationality | null
}