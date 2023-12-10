import { sheets } from "@googleapis/sheets";
import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import * as demonlist from "./demonlist/index";
import Player from "./structures/Player";
import RankedPlayer from "./structures/RankedPlayer";
import * as config from "./utils/config";
import { excel } from "./utils/constants";
import { validatedInput } from "./utils/input";
import { isNullOrUndefined } from "./utils/is-null-or-undefined";
import * as logger from "./utils/logger";
import wait from "./utils/wait";

const auth = new JWT({
    email: config.get("accountEmail"),
    key: config.get("accountPrivateKey"),
    scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive.file"
    ]
});

const spreadsheet = new GoogleSpreadsheet(config.get("spreadsheetId") as string, auth);
const sheetsApi = sheets("v4");

(async () => {

    logger.run(`welcome!\n`, { color: "yellow" });
    const count = parseInt(
        await validatedInput(
            logger.color(
                "how many players would you like to add to the spreadsheet? ",
                "cyan"
            ),
            logger.color(
                "specify a valid number of players to add: ",
                "cyan"
            ),
            (input) => !isNaN(parseInt(input)) && parseInt(input) > 0
        )
    );
    const requestDelay = parseInt(
        await validatedInput(
            logger.color(
                "specify a delay between the requests to the demonlist (in seconds) - 0, 1 or 2 should be enough: ",
                "cyan"
            ),
            logger.color(
                "specify a valid delay between the requests to the demonlist (in seconds): ",
                "cyan"
            ),
            (input) => !isNaN(parseInt(input)) && parseInt(input) >= 0
        )
    ) * 1000;

    const startedTimestamp = Date.now();
    const listInformation = await demonlist.fetchListInformation();
    logger.run("\nfetched demonlist list information ✓", { color: "green" });
    await wait(requestDelay);

    logger.run("\nmaking ranking requests to the demonlist api...", { color: "yellow" });
    let after = 0;
    let players: RankedPlayer[] = [];
    while (players.length < count) {
        const collected = await demonlist.fetchRanking(after);
        logger.run(`- fetched ranking from ${after} to ${after + 50} ✓`, { color: "green" });
        players.push(...collected);
        after = players.length;
        await wait(requestDelay);
    }

    players = players.slice(0, count);

    logger.run("\nmaking individual player requests to the demonlist api...", { color: "yellow" });
    const playerData = new Map<number, Player>();
    for (let index = 0; index < players.length; index++) {
        const player = players[index];
        const data = await demonlist.fetchPlayer(player.id);
        logger.run(`- fetched full information of: ${player.name} (${index + 1}/${players.length}) ✓`, { color: "green" });
        playerData.set(player.id, data);
        await wait(requestDelay);
    }

    await spreadsheet.loadInfo();
    const oldWorksheetPlayers = new Map<number, { name: string, rank: number, score: number }>();

    if (spreadsheet.sheetCount > 0) {
        logger.run("\ngetting data from the last generated sheet...", { color: "yellow" });
        const oldWorksheet = spreadsheet.sheetsByIndex[spreadsheet.sheetCount - 1];
        const { data: oldWorksheetData } = await sheetsApi.spreadsheets.get({
            spreadsheetId: spreadsheet.spreadsheetId,
            ranges: [`${oldWorksheet.title}!A1:K${oldWorksheet.rowCount}`],
            auth,
            fields: "sheets(data)"
        });
        const rows = oldWorksheetData.sheets?.at(0)?.data?.at(0)?.rowData;
        rows?.slice(3).forEach(row => {
            const playerId = row.values?.find((_, i) => {
                return rows[2].values?.at(i)?.formattedValue === "Player ID"
            })?.formattedValue;
            const name = row.values?.find((_, i) => {
                return rows[2].values?.at(i)?.formattedValue === "Player"
            })?.formattedValue;
            const rank = row.values?.find((_, i) => {
                return rows[2].values?.at(i)?.formattedValue === "Rank"
            })?.formattedValue;
            const points = row.values?.find((_, i) => {
                return rows[1].values?.at(i)?.formattedValue === "List" &&
                rows[2].values?.at(i)?.formattedValue === "Points"
            })?.formattedValue;
            if (
                isNullOrUndefined(playerId) ||
                isNullOrUndefined(name) ||
                isNullOrUndefined(points) ||
                isNullOrUndefined(rank)
            ) return;
            oldWorksheetPlayers.set(
                parseInt(playerId as string),
                {
                    name: name as string,
                    rank: parseInt(rank?.replace("#", "") as string),
                    score: parseFloat(points as string)
                }
            )
        });

        logger.run(`- got ${oldWorksheetPlayers.size} players from sheet: "${oldWorksheet.title}"`, { color: "green" });
    }

    logger.run("\nmodifying google sheet...", { color: "yellow" });
    const sheets = Object.keys(spreadsheet.sheetsByTitle);
    const currentDate = new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
    }).format(new Date);

    let number = 0;
    let title = `${currentDate}`;
    while (sheets.includes(title)) {
        number++;
        title = `${currentDate} ${number}`;
    }

    const worksheet = await spreadsheet.addSheet({ title });
    logger.run(`- added a new sheet: "${worksheet.title}" ✓`, { color: "green" });

    await worksheet.loadCells("A1:K3");
    await worksheet.mergeCells({
        startColumnIndex: 0,
        startRowIndex: 0,
        endColumnIndex: 11,
        endRowIndex: 1,
        sheetId: worksheet.sheetId
    });

    [
        { value: "", cell: "A2" },
        { value: "Diff", cell: "A3", bottomBorder: true },
        { value: "", cell: "B2" },
        { value: "Player ID", cell: "B3", bottomBorder: true },
        { value: "", cell: "C2" },
        { value: "Flag", cell: "C3", bottomBorder: true },
        { value: "", cell: "D2" },
        { value: "Rank", cell: "D3", bottomBorder: true },
        { value: "", cell: "E2" },
        { value: "Player", cell: "E3", bottomBorder: true },
        { value: "List", cell: "F2" },
        { value: "Points", cell: "F3", bottomBorder: true },
        { value: "Main", cell: "G2" },
        { value: "Lists", cell: "G3", bottomBorder: true },
        { value: "Extended", cell: "H2" },
        { value: "Lists", cell: "H3", bottomBorder: true },
        { value: "Legacy", cell: "I2" },
        { value: "Lists", cell: "I3", bottomBorder: true },
        { value: "Previous", cell: "J2", leftBorder: true },
        { value: "Rank", cell: "J3", leftBorder: true, bottomBorder: true },
        { value: "Previous", cell: "K2" },
        { value: "Points", cell: "K3", bottomBorder: true },
    ].forEach((column) => {
        const cell = worksheet.getCellByA1(column.cell);
        cell.value = column.value;
        cell.verticalAlignment = "MIDDLE";
        cell.horizontalAlignment = "CENTER";
        cell.borders = {
            left: (column.leftBorder ? excel.borders.black : excel.borders.none) as any,
            bottom: (column.bottomBorder ? excel.borders.black : excel.borders.none) as any,
            top: excel.borders.lightRed as any,
            right: excel.borders.lightRed as any
        };
        cell.backgroundColorStyle = excel.colorStyles.lightRed;
    });
    logger.run(`- columns labels created ✓`, { color: "green" });
    await worksheet.saveUpdatedCells();

    worksheet.setHeaderRow(["-"]); // this will be changed later, it's just for the library not to complain

    await worksheet.loadCells(`A4:K${3 + players.length}`); // CHANGE THIS
    const { format: formatNumber } = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
        useGrouping: false
    });
    const recordCounter = new demonlist.RecordCounter(listInformation);
    for (let index = 0; index < players.length; index++) {
        const player = players[index];
        const oldPlayer = oldWorksheetPlayers.get(player.id);
        const data = playerData.get(player.id) as Player;
        const rowIndex = index + 4;
        const values = [
            "-",
            player.id,
            "?",
            `#${player.rank}`,
            player.name,
            formatNumber(player.score),
            recordCounter.countMain(data),
            recordCounter.countExtended(data),
            recordCounter.countLegacy(data),
            oldPlayer ? (oldPlayer.rank === player.rank ? "-" : `#${oldPlayer.rank}`) : "-",
            oldPlayer ? (
                formatNumber(oldPlayer.score) === formatNumber(player.score) ? "-" : oldPlayer.score.toString()
            ) : "-"
        ];
        for (let columnIndex = 0; columnIndex < 11; columnIndex++) {
            const cell = worksheet.getCell(rowIndex - 1, columnIndex);
            cell.value = values[columnIndex];
            cell.borders = {
                left: excel.borders.lightRed as any,
                bottom: excel.borders.lightRed as any,
                top: excel.borders.lightRed as any,
                right: excel.borders.lightRed as any
            };
            if (index % 2 === 0) { // yellow background every 2 rows
                cell.backgroundColorStyle = excel.colorStyles.yellow as any;
            }
            cell.horizontalAlignment = "CENTER";
            cell.verticalAlignment = "MIDDLE";
            switch (columnIndex) {
                case 0: // diff column
                    cell.textFormat = { foregroundColorStyle: excel.colorStyles.white };
                    cell.backgroundColorStyle = excel.colorStyles.gray as any;
                    const difference = oldPlayer ? player.rank - oldPlayer.rank : 0;
                    if (difference > 0) {
                        cell.value = `+${difference}`;
                        cell.backgroundColorStyle = excel.colorStyles.red;
                    } else if (difference < 0) {
                        cell.value = difference.toString();
                        cell.backgroundColorStyle = excel.colorStyles.green;
                    }
                    break;

                case 2: // flag column
                    if (player.nationality?.country_code) {
                        cell.formula = `=IMAGE("https://flagcdn.com/h40/${player.nationality.country_code.toLowerCase()}.png")`;
                    }
                    break;

                case 3: // rank column
                    cell.horizontalAlignment = "RIGHT";
                    cell.textFormat = { bold: true };
                    break;

                case 4: // player column
                    cell.horizontalAlignment = "LEFT";
                    cell.textFormat = { bold: true };
                    break;
                
                case 9: // previous rank column
                    // just using "...cell.borders" doesn't work bc i have to save the cell....
                    cell.borders = {
                        left: excel.borders.black as any,
                        bottom: excel.borders.lightRed as any,
                        top: excel.borders.lightRed as any,
                        right: excel.borders.lightRed as any
                    };
                    break;
            }
        }
    }
    await worksheet.saveUpdatedCells();
    logger.run(`- columns filled in ✓`, { color: "green" });

    await sheetsApi.spreadsheets.batchUpdate({
        requestBody: {
            requests: [
                {
                    autoResizeDimensions: {
                        dimensions: {
                            sheetId: worksheet.sheetId,
                            dimension: "COLUMNS",
                            startIndex: 0,
                            endIndex: 11,
                        }
                    }
                }
            ]
        },
        auth,
        spreadsheetId: spreadsheet.spreadsheetId
    });
    await sheetsApi.spreadsheets.batchUpdate({
        requestBody: {
            requests: [
                {
                    updateDimensionProperties: {
                        range: {
                            sheetId: worksheet.sheetId,
                            dimension: "COLUMNS",
                            startIndex: 4, 
                            endIndex: 5, // player column
                        },
                        properties: {
                            pixelSize: Math.max(...players.map(e => e.name.length)) * 8
                        },
                        fields: "pixelSize"
                    }
                },
                {
                    updateDimensionProperties: {
                        range: {
                            sheetId: worksheet.sheetId,
                            dimension: "COLUMNS",
                            startIndex: 2, 
                            endIndex: 3, // player column
                        },
                        properties: {
                            pixelSize: 35
                        },
                        fields: "pixelSize"
                    }
                }
            ]
        },
        auth,
        spreadsheetId: spreadsheet.spreadsheetId
    });
    logger.run(`- adjusted columns size ✓`, { color: "green" });

    const headerCell = worksheet.getCellByA1("A1");
    headerCell.value = new Intl.DateTimeFormat("en-US", {
        dateStyle: "long",
        timeStyle: "long",
    }).format(new Date());
    headerCell.textFormat = { italic: true, fontSize: 16 };
    await headerCell.save();
    logger.run(`- date header ✓`, { color: "green" });

    logger.run(`\ndone in ${formatNumber((Date.now() - startedTimestamp) / 1000)}s! you can see the changes on the spreadsheet:`, { color: "yellow" })
    logger.run(`https://docs.google.com/spreadsheets/d/${spreadsheet.spreadsheetId}`, { color: "green" })

})();