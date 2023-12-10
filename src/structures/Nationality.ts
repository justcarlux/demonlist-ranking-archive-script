import Subdivision from "./Subdivision";

export default interface Nationality {
    country_code: string,
    nation: string,
    subdivision: Subdivision | null
}