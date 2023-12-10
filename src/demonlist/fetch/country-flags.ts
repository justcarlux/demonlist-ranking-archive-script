export default async function fetchCountryFlagSvg(
    countryCode: string
): Promise<
    string
> {
    return await (
        await fetch(`https://pointercrate.com/static/demonlist/images/flags/${countryCode}.svg`)
    ).text();
}