import MinimalDemon from "./MinimalDemon";
import Player from "./Player";
import RecordStatus from "./RecordStatus";

export default interface MinimalRecord {
    id: number,
    progress: number,
    status: RecordStatus,
    video: string | null,
    player: Player | null,
    demon: MinimalDemon | null
}