declare module "convert-svg-to-png" {
    function convert(input: string | Buffer, options: any): Promise<Buffer>
}