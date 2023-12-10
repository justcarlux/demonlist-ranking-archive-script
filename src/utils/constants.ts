const excel = {
    borders: {
        none: {
            style: "NONE"
        },
        black: {
            style: "SOLID",
            colorStyle: {
                rgbColor: {
                    red: 0,
                    green: 0,
                    blue: 0
                }
            }
        },
        lightRed: {
            style: "SOLID",
            colorStyle: {
                rgbColor: {
                    red: 0.8431372549019608,
                    green: 0.7058823529411765,
                    blue: 0.7058823529411765
                }
            },
            width: 1
        },
    },
    colorStyles: {
        lightRed: {
            rgbColor: {
                red: 0.9568627450980393,
                green: 0.8,
                blue: 0.8
            }
        },
        yellow: {
            rgbColor: {
                red: 1,
                green: 0.9490196078431372,
                blue: 0.8
            }
        },
        gray: {
            rgbColor: {
                red: 0.6,
                green: 0.6,
                blue: 0.6
            }
        },
        white: {
            rgbColor: {
                red: 1,
                green: 1,
                blue: 1
            }
        },
        green: {
            rgbColor: {
                red: 0.20392156862745098,
                green: 0.6588235294117647,
                blue: 0.3254901960784314
            }
        },
        red: {
            rgbColor: {
                red: 1,
                green: 0,
                blue: 0
            }
        }
    }
}

export {
    excel
}