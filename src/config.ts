import os from 'os';

export const config = {
    login:'',
    password:'',
    shared_secret:'',

    floatCheckerPath: `${os.homedir()}\\AppData\\Local\\Temp\\puppeteer_dev_chrome_profile-GfboDU\\Default\\Extensions\\jjicbefpemnphinccgikpdaagjebbnhg\\2.4.3_0`,

    headless: false,
    requestIntervalInMinutesBuy: 0.75,
    requestIntervalInMinutesOrder: 10,
    typingDelay: 600,
    steamFee: 13,
    currencyCode: 5
}
