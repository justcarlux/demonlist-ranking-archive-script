import readline from "node:readline";

export async function input(question: string) {
    const rl = readline.createInterface(process.stdin, process.stdout);
    return await new Promise<string>((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer || "");
        });
    });
}

export async function validatedInput(question: string, failText: string, validator: (text: string) => boolean) {
    let text = "";
    let attempts = 0;
    while (!validator(text) || attempts === 0 || !text) {
        text = await input(!text ? question : failText);
        attempts++;
    }
    return text;
}