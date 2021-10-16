require('dotenv').config()
const chromium = require('chrome-aws-lambda')
const TelegramBot = require('node-telegram-bot-api')
const { MongoClient } = require('mongodb')

const main = async () => {
  const client = new MongoClient(process.env.MONGODB_URL)
  await client.connect()
  const db = client.db('general').collection('riskivapaa')
  const bot = new TelegramBot(process.env.BOT_TOKEN)
  const pageLink = 'https://riskivapaa.com/fi'
  const doneOnes = [
    'Casumo',
    'Fastbet',
    'RoyalPanda',
    'Vauhti',
    'Barz',
    'Huikee',
    'parhaat Lucky',
    'CasinoDays',
    'Praise',
    'Boom',
    'Expekt',
    'Pelataan',
  ]

  browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  })
  const page = await browser.newPage()
  await page.goto(pageLink, { timeout: 0 })

  const results = await page.evaluate(() => {
    const results = []
    document.querySelector('.primary-Gbtn.large-Btn').click()
    const items = document.querySelectorAll('.top-Listse')

    items.forEach((item) => {
      let title = item.querySelector('.bonusPromoTitle')
      const amountString = item.querySelector('.primary-Gbtn.full-Width')
      const amount = Number(amountString.innerText.replace(/\D/g, ''))
      if (amount > 40) {
        title = title.innerText
        title = title.slice(5, title.indexOf('ilman rekisteröitymistä') - 6).trim()
        results.push(title)
      }
    })
    return results
  })
  const resultsLastTime = (await db.find().toArray()).map((item) => item.name)
  let message = 'Kasinotilanne päivittyi:\n\n'
  let shouldSendMessage = false
  results.forEach((item) => {
    if (!resultsLastTime.includes(item)) {
      message += `<b><i>${item}</i></b>${doneOnes.find((str) => str.includes(item)) ? '' : '!'}\n`
      shouldSendMessage = true
    } else {
      message += item + '\n'
    }
  })
  resultsLastTime.forEach((item) => {
    if (!results.includes(item)) {
      message += `<s>${item}</s>\n`
      shouldSendMessage = true
    }
  })

  if (shouldSendMessage) {
    bot.sendMessage('-598913738', message, { parse_mode: 'HTML' })
    await db.deleteMany()
    db.insertMany(results.map((item) => ({ name: item })))
  }
  await browser.close()
  return
}

main()

module.exports.main = main
