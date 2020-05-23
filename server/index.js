// REQUIREMENTS

// native
const path = require('path');

// 3rd party
const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
const fetch = require("node-fetch");

// local
const app = express();
const port = process.env.PORT || 8000;

// MIDDLEWARE
app.use(express.static(path.join(__dirname, '../public')));
app.use('/css', express.static(__dirname + '../node_modules/bootstrap/dist/css'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// allow cors to access this backend
app.use( (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// INIT SERVER
app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

// helper functions

// scrape
let scrape = async (searchWord) => {
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
    const page = await browser.newPage();
    await page.goto(`https://www.google.com/search?&q=${searchWord}`);

    const result = await page.evaluate(() => {
        let movieList = [];
        let elements = document.querySelectorAll('.nVcaUb');
        for (var element of elements){
            let temp = element.childNodes[0].textContent;
            if(temp != "undefined"){
                movieList.push(temp);
            }
        }
        return movieList;
    });
    await page.close();
    await browser.close();
    return result;
};

// ROUTES
// root
app.get('/', function (req, res) {
    res.send('hello world');
});

// post, get form data from frontend
// return array of object with searchKey and count to frontend
app.post('/api', async function (req, res) {
    let curSearchKey1 = req.body.searchKey1 || "";
    let curSearchKey2 = req.body.searchKey2 || "";
    let curSearchKey3 = req.body.searchKey3 || "";
    let curSearchKeys = [curSearchKey1, curSearchKey2, curSearchKey3]
    searchResults1 = [curSearchKey1];
    searchResults2 = [curSearchKey2];
    searchResults3 = [curSearchKey3];
    console.log("3 search keys: ", curSearchKeys);
    let resultList = [];
    //
    let tryLoop = async () => {
        for(let i = 0; i < 3; i++){
            await scrape(curSearchKeys[i])
            .then((rlist) => {
                // resultList = [...resultList, curSearchKeys[i], ...rlist];
                resultList = [...resultList, {key: curSearchKeys[i], value: rlist}];
            })
        }
        return resultList;
    }
    await tryLoop()
    .then((rlist) => {
        res.status(200).send(rlist);
    });
    // await scrape(curSearchKey1)
    // .then((rlist) => {
    //     searchResults1 = [...searchResults1, ...rlist];
    // })
    // await scrape(curSearchKey2)
    // .then((rlist) => {
    //     searchResults2 = [...searchResults2, ...rlist];
    // });
    // await scrape(curSearchKey3)
    // .then((rlist) => {
    //     searchResults3 = [...searchResults3, ...rlist];
    // });
    // res.status(200).send([...searchResults1,...searchResults2,...searchResults3]);
});
