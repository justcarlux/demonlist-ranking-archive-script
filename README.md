# DemonList Ranking Archive Script
Simple script to fetch statistics from the Demonlist Stats Viewer and save them in a Google Sheet. Original idea from this [tweet](https://twitter.com/VVenom95/status/1731248195941158980) of [@VVenom95](https://twitter.com/VVenom95).

Currently being used in the public spreadsheet made by her:
https://docs.google.com/spreadsheets/d/1H0kFIWFAaOaD6-h9Kq3SnPe8tfHn5sshuQ2x9ZWT2yI/

![Script image](https://i.imgur.com/XzFUOPi.png)

# Running:

- Download [Node.js](https://nodejs.org/en).
- Clone this repository.
- Create a file in the folder where you cloned the repository called `config.json` and fill in the required information:

```json
{
    "accountEmail": "<google service account email>",
    "accountPrivateKey": "<google service account private key>",
    "spreadsheetId": "<google spreadsheet id, where the account has permission to edit>"
}
```

- Open your terminal in the folder where you cloned this repository.
- Type in `npm i` to install the required packages.
- Type in `npm run build` to build the codebase with `tsc`.
- Type in `npm run start:build` to run the program.
- You can also run the program directly with `npm run start:dev`. This will use `ts-node`.