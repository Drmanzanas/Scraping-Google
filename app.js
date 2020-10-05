const express = require('express');
const app = express();
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { html } = require('cheerio');
const { title } = require('process');
const port = 1024

// ---- FUNCTIONS ----

let getDescription = async (app,id) => {
    let description = {};
    try{
        let url = 'https://play.google.com' + app.parent.attribs.href
        let browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url)
        let info = new Promise((resolve,reject) => {
        setTimeout(async () => {
            let body = await page.content()
            let $ = cheerio.load(body)
            let result = {
                title: $('.oQ6oV h1 > span').text(),
                desc: $(`div[jsname="sngebd"]`).text(),
                downloads: $('.IxB2fe .hAyfc:nth-of-type(3) .htlgb').last().html().split('+')[0]
            }
            resolve(result)
            browser.close()
        },5000)
    })
    description.id = id
    description.info = await info
    }catch(err){
        throw err
    }finally{
        return description
    }
    
}

let findApps = async (name,p) => {
    try{
        let apps,description = [],url;
        if(name === undefined)
            url = `https://play.google.com/store/apps`;
        else
            url = `https://play.google.com/store/search?q=${name}&c=apps`;
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url);
        apps = new Promise((res,rej) => {
            setTimeout(async () =>{
                let body = await page.content();
                let $ = cheerio.load(body)

                let err = $('.fTwQgc').text()
                if(err.length > 0)
                    res(false)
                let games = $('.WsMG1c.nnK0zc').toArray()
                browser.close()
                res(games)
            }, 5000)
        })
        apps = await apps
        if(!apps)
            return false
        let x = p * 5 - 5
        let y;
        apps.length < 5 ? y = apps.length : y = p * 5
        if(apps.length > 0){
            while(x < y){
                description.push(await getDescription(apps[x],x))
                x++;
            }
        } else {
            description = false
        }
        return description
        
    }catch(err){
        throw err
    }
}


// ---- ENDPOINTS ----

app.get('/apps', (req,res) => {
    let name = req.query.name
    let page = req.query.page 
    if(isNaN(page) && page !== undefined)
        res.send({error : 'Page Not Found'})
    if(page === undefined)
        page = 1
    findApps(name,page).then( data => !data ? res.send({ error : 'Search not found '}) : res.send({ data }))
})



app.listen(port, () => console.log('Escuchando en el puerto: ' + port))