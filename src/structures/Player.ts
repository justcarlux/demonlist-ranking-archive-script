import MinimalDemon from "./MinimalDemon"
import MinimalRecord from "./MinimalRecord"
import Nationality from "./Nationality"

export default interface Player {
    id: number,
    name: string,
    banned: boolean,
    nationality: Nationality | null,
    created: MinimalDemon[],
    records: MinimalRecord[],
    published: MinimalDemon[],
    verified: MinimalDemon[]
}