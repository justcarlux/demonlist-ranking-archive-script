import DemonListInformation from "../../structures/DemonListInformation";

export default async function fetchListInformation(): Promise<
    DemonListInformation
> {
    return await (
        await fetch("https://pointercrate.com/api/v1/list_information/")
    ).json();
}