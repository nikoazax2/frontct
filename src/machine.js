const needle = require("needle")
const lopen = require("open")
const googleTrends = require("google-trends-api")
const token =
    "AAAAAAAAAAAAAAAAAAAAANyPagEAAAAACHr6i6ZweitZOMygdG2S%2B8pCOfY%3DndB1VkTq0ZlngLPHoEZdzR4dMaFT8mLvx8dViZGQW2VBTuK0S5"
const endpointUrl = "https://api.twitter.com/2/tweets/counts/recent"
const version = "1.1"

const rechercheTokenConst = "minifootball"
const time = "hour" //'hour' or 'day'
const excel = false
const enormeAugmentation = 7
const nbHeuresCoef = 2
const AnnuleNuit = true

//lancer le prgrm à 15h et 11h et 20h
// car les heures les plus fortes sont 14 10 et 19h

async function getRequestTwitter(recherche) {
    const params = {
        "query": recherche,
        "granularity": time,
    }

    const res = await needle("get", endpointUrl, params, {
        headers: {
            "User-Agent": "v2RecentTweetCountsJS",
            "authorization": `Bearer ${token}`,
        },
    })

    if (res.body) {
        return res.body
    } else {
        throw new Error("Unsuccessful request")
    }
}

async function getTwitterCoin(recherche) {
    const params = `https://api.coingecko.com/api/v3/coins/${recherche}`,
        res = await needle("get", params, {})

    if (res.body) {
        return res.body
    } else {
        throw new Error("Unsuccessful request")
    }
}

async function twitter(idToken, rechercheToken) {
    let compenseNuit = {
        20: 1.46,
        21: 1.33,
        22: 1.66,
        23: 2,
        0: 2.33,
        1: 2.66,
        2: 3,
        3: 2.66,
        4: 2.33,
        5: 2,
        6: 1.66,
        7: 1.33,
        8: 1.32,
    }
    try {
        const response = await getRequestTwitter(rechercheToken)
        console.log(response.status == "429" ? "Limite twitter" : "")
        if (response.status == "429") {
            console.log("attente 15min")
            await sleep(900000)
        }
        let interressant = { date: null, coef_augm: 0 }
        let coef_augmentation = 1
        let tab = [["Twitter", ""], [rechercheToken]]
        let coef_augm = 0
        //coef_augm nb tweets
        let max_of_tweets = 0

        response.data
            ? response.data.forEach((element) => {
                  element.tweet_count > max_of_tweets ? (max_of_tweets = element.tweet_count) : ""
              })
            : ""

        response.data
            ? response.data.forEach((element, index) => {
                  //Date
                  let datedeb = new Date(element.start)
                  month = datedeb.getMonth() + 1
                  month.toString().length == 1 ? (month = "0" + month.toString()) : ""
                  hour = datedeb.getHours()
                  hour.toString().length == 1 ? (hour = "0" + hour.toString()) : ""
                  let datedebfromat = `${datedeb.getFullYear()}-${month}-${datedeb.getDate()}T${hour}:00:00`

                  //Remplis
                  tab.push([datedebfromat, element.tweet_count])
              })
            : ""
        //Alerte
        //coefs
        let coef_augmentation_analyse = 0
        for (let index = 0; index < tab.length; index++) {
            if (tab[index]) {
                //coef augm
                let moyenneBasse = 0
                let divise = 0
                for (let index2 = index; index2 > 0; index2--) {
                    if (tab[index2][1]) {
                        moyenneBasse = moyenneBasse + tab[index2][1]
                        divise = divise + 1
                    }
                }

                moyenneBasse = moyenneBasse / divise
                moyenneHaute = tab[index][1]

                if (moyenneHaute && moyenneBasse) {
                    coef_augm = (moyenneHaute / moyenneBasse) * 100
                    coef_augm > coef_augmentation_analyse
                        ? (coef_augmentation_analyse = moyenneHaute / moyenneBasse)
                        : ""
                }

                if (coef_augm && coef_augm > interressant.coef_augm) {
                    //coef_augm stab
                    //Calcul moyenne prochains points
                    let tot_sup_stab = 0
                    let nb_sub_stab = 0
                    let moy_sup_stab = 0
                    for (let index2 = index; index2 < tab.length; index2++) {
                        if (tab[index2][1] !== "undefined") {
                            moy_sup_stab = moy_sup_stab + tab[index2][1]
                            nb_sub_stab = nb_sub_stab + 1
                        }
                    }
                    tot_sup_stab = moy_sup_stab / nb_sub_stab
                    tot_sup_stab = Math.max(tot_sup_stab, tab[index][1]) - Math.min(tot_sup_stab, tab[index][1])

                    interressant = {
                        date: tab[index][0],
                        coef_augm: coef_augm ? coef_augm : "0",
                        coef_stab: tot_sup_stab ? tot_sup_stab : "0",
                    }
                }
            }
        }
        if (!interressant.coef_stab || interressant.coef_stab == "0") {
            coef_stab = "0"
        } else {
            coef_stab = format(interressant.coef_stab)
        }

        return {
            tab: tab,
            analyse: {
                coef_augm: format(interressant.coef_augm),
                coef_stab: coef_stab,
                coef_general: interressant.coef_augm - interressant.coef_stab * 4.5,
                date: interressant.date,
                id: idToken,
            },
        }
    } catch (e) {
        console.log(e)
        process.exit(-1)
    }
    process.exit()
}

async function getList250Crypto(page) {
    const params = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=gecko_desc&per_page=250&page=${page}&sparkline=false`,
        res = await needle("get", params, {})

    if (res.body && res.body.length > 0) {
        let coinsFiltered = []
        if (res.body && res.body.length > 0) {
            res.body.forEach((coin) => {
                if (coin.current_price > 0 && coin.current_price < 0.0001) {
                    coinsFiltered.push({ id: coin.id, coin: coin })
                }
            })
        }
        return coinsFiltered
    } else {
        throw new Error("Unsuccessful request")
    }
}

async function machineCalculCrypto(rechercheToken = "") {
    twitterName = await getTwitterCoin(rechercheToken)
    if (twitterName && twitterName.links && twitterName.links.twitter_screen_name) {
        tabTwitterData = await twitter(
            rechercheToken,
            `@${twitterName.links.twitter_screen_name} -(from:${twitterName.links.twitter_screen_name}) -is:reply`
        )

        tabTwitter = tabTwitterData.tab
        //message = tabTwitterData.message

        // console.log(message)

        max = tabTwitter.length

        return tabTwitterData.analyse
    } else {
        return ""
    }
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}
function format(value) {
    return value ? value.toFixed(2).toString().replace(/\./g, ",") : ""
}
async function main() {
    let resultats = [["ID", "Date", "Prix", "Coef augm", "Coef stab", "Coef general", "page"]]
    let pageATraiterMin = 1
    let pageATraiterMax = 50
    let nbEffectue = 0
    for (let page = pageATraiterMin; page <= pageATraiterMax; page++) {
        let coins = await getList250Crypto(page)

        for (let index = 0; index < coins.length; index++) {
            nbEffectue = nbEffectue + 1
            let analyse = await machineCalculCrypto(coins[index].id)

            if (
                analyse.id !== undefined &&
                analyse.date !== undefined &&
                analyse.coef_augm !== undefined &&
                analyse.date !== undefined &&
                analyse.date != "" &&
                analyse.coef_augm != "" &&
                analyse.coef_augm !== "0.00" &&
                parseFloat(analyse.coef_augm) > 0
            ) {
                let price = format(coins[index].coin.current_price)
                resultats.push([
                    analyse.id,
                    analyse.date,
                    parseFloat(coins[index].coin.current_price)
                        ? parseFloat(coins[index].coin.current_price).toFixed(12).toString().replace(/\./g, ",")
                        : "",
                    analyse.coef_augm,
                    analyse.coef_stab,
                    format(analyse.coef_general),
                    page,
                ])
            }
            if (nbEffectue % 20 == 0) {
                console.log("attente 1min")
                await sleep(60000)
            }
            console.log(nbEffectue + " : page " + page + " " + ((index / coins.length) * 100).toFixed(0) + "% ")
            console.log([
                analyse.id,
                analyse.date,

                "Prix : " +
                    (parseFloat(coins[index].coin.current_price)
                        ? parseFloat(coins[index].coin.current_price).toFixed(12).toString().replace(/\./g, ",")
                        : ""),
                "Coef augm : " + analyse.coef_augm,
                "Coef stab : " + analyse.coef_stab,
                "Coef général :" + format(analyse.coef_general),
            ])
        }

        //DL excel
        let csvContent = "data:text/csv;charset=utf-8," + resultats.map((e) => e.join(";")).join("\n")
        var encodedUri = encodeURI(csvContent.replace(/#/g, ""))
        console.log(encodedUri)
    }
}

;(async () => {
    main()
})()
