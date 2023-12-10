import DemonListInformation from "../../structures/DemonListInformation";
import Player from "../../structures/Player";

export class RecordCounter {
    
    private listInformation: DemonListInformation;
    constructor(info: DemonListInformation) {
        this.listInformation = info;
    }
    
    private getCounts(player: Player) {
        const { list_size, extended_list_size } = this.listInformation;
        const beaten = player.records.filter((record) => record.progress === 100);
        const legacy = beaten.filter((record) => (record.demon?.position as number) > extended_list_size).length;
        const extended = beaten.filter((record) => (record.demon?.position as number) > list_size && (record.demon?.position as number) <= extended_list_size).length;
        const verifiedExtended = player.verified.filter((demon) => (demon?.position as number) <= extended_list_size && (demon.position as number) > list_size).length;
        const verifiedLegacy = player.verified.filter((demon) => (demon?.position as number) > extended_list_size).length;
        return { beaten, legacy, extended, verifiedExtended, verifiedLegacy };
    }

    public countMain(player: Player) {
        const { beaten, legacy, extended, verifiedExtended, verifiedLegacy } = this.getCounts(player);
        return beaten.length - legacy - extended + player.verified.length - verifiedExtended - verifiedLegacy;
    }
    
    public countExtended(player: Player) {
        const { extended, verifiedExtended } = this.getCounts(player);
        return extended + verifiedExtended;
    }
    
    public countLegacy(player: Player) {
        const { legacy, verifiedLegacy } = this.getCounts(player);
        return legacy + verifiedLegacy;
    }

}