import RankedPlayer from "../../structures/RankedPlayer";

export default async function fetchRanking(
    after: number
): Promise<
    RankedPlayer[]
> {
    return await (
        await fetch(`https://pointercrate.com/api/v1/players/ranking/?after=${after}`)
    ).json();
}