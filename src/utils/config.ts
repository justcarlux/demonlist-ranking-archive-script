import { readFileSync, writeFileSync } from "fs";
import path from "node:path";

export interface IConfiguration {
    accountEmail?: string,
    accountPrivateKey?: string,
    spreadsheetId?: string
}

const required: (keyof IConfiguration)[] = [
    "accountEmail",
    "accountPrivateKey",
    "spreadsheetId"
];

const filePath = path.join(process.cwd(), "config.json");
let config: IConfiguration = {};
try {
    config = JSON.parse(
        readFileSync(filePath, { encoding: "utf-8" })
    )
} catch (err) {}

const missing = required.filter(key => {
    if (config[key as keyof IConfiguration]) return false;
    return true;
})
if (missing.length) {
    throw new Error(`Missing keys from configuration file: ${missing.join(", ")}`);
}

export function get<K extends keyof IConfiguration>(key: K): IConfiguration[K] {
    return config[key];
}

export function set<K extends keyof IConfiguration>(
    key: K, value: IConfiguration[K]
) {
    if (!value) {
        delete config[key];
    } else {
        config[key] = value;
    }
}

export async function save() {
    try {
        writeFileSync(filePath, JSON.stringify(config, null, 4));
    } catch (err) {
        console.log(err);
    }
}

export function getAll() {
    return config;
}