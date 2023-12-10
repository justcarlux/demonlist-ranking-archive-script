import Player from "../../structures/Player";

export default async function fetchPlayer(
    playerId: number
): Promise<
    Player
> {
    return (await (
        await fetch(`https://pointercrate.com/api/v1/players/${playerId}`)
    ).json()).data;
}