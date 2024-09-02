const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;


const API_KEY = "RGAPI-720883c8-739f-41a0-ba53-b952d23973fd";
const platform = "jp1";
const region = "asia";
// const summonerName = "優しいゴーヤs";
const summonerName = "ceros";
// const tagline = "6106";
const tagline = "111";

// 本当はダメらしいdbとか使ったほうがいいらしい
let puuid; // puuidをグローバルスコープで定義
let summonerId; // summonerIdをグローバルスコープで定義


// CORSを許可する
app.use(cors());

//postで情報を受け入れる
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "https://tracklol.web.app/");
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTION"
    );
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});


// サーバーを起動
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// // サーバーが起動した後にdataFromAPIを確認
server.on('listening', async () => {
    try {
        // Riot APIにリクエストを送信
        const response = await axios.get(`https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${summonerName}/${tagline}?api_key=${API_KEY}`);
        // puuidをグローバル変数にセット
        puuid = response.data.puuid;

        const summonerResponse = await axios.get(`https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${API_KEY}`);
        // summonerIdをグローバル変数にセット
        summonerId = summonerResponse.data.id;


    } catch (error) {
        console.log('Data from API has not been fetched yet.');
    }
});



// Riot APIエンドポイントへのリクエストを処理するハンドラ
app.get('/account', async (req, res) => {
    try {
        // Riot APIにリクエストを送信
        const response = await axios.get(`https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${summonerName}/${tagline}?api_key=${API_KEY}`);
        // レスポンスをクライアントに返す
        res.json(response.data);


    } catch (error) {
        // エラーが発生した場合はエラーメッセージを返す
        res.status(500).json({
            error: error.message
        });
    }
});

// POSTリクエストを処理するハンドラ
app.post('/account', async (req, res) => {
    try {
        const { summonerName, tagline } = req.body; // リクエストボディからデータを取得
        console.log("Received summonerName:", summonerName);
        console.log("Received tagline:", tagline);

        // Riot APIにリクエストを送信
        const response = await axios.get(`https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${summonerName}/${tagline}?api_key=${API_KEY}`);

        // puuidをグローバル変数にセット
        puuid = response.data.puuid;

        // レスポンスをクライアントに返す
        res.json(response.data);
    } catch (error) {
        // エラーが発生した場合はエラーメッセージを返す
        res.status(500).json({
            error: error.message
        });
    }
});



app.get('/account02', async (req, res) => {

    /*
    以下が含まれるAPI
    id
    accountId
    puuid
    profileIconId
    revisionDate
    summonerLevel
    */

    try {
        // puuidが未定義の場合はエラーを返す
        if (!puuid) {
            throw new Error('puuid is not defined');
        }

        // Riot APIにリクエストを送信
        const response = await axios.get(`https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${API_KEY}`);
        res.json(response.data);


    } catch (error) {
        // エラーが発生した場合はエラーメッセージを返す
        res.status(500).json({
            error: error.message
        });
    }
});


app.get('/latestMatches', async (req, res) => {
    try {
        // puuidが未定義の場合はエラーを返す
        if (!puuid) {
            throw new Error('puuid is not defined');
        }

        // Riot APIにリクエストを送信
        // 最新10件のmatchIds取得
        const response = await axios.get(`https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=10&api_key=${API_KEY}`);
        const matchIds = response.data;
        const matches = [];

        // matchIdsをループしてそれぞれの試合情報を取得
        for (const matchId of matchIds) {
            const matchResponse = await axios.get(
                `https://${region}.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${API_KEY}`
            );
            matches.push(matchResponse.data);
        }

        // レスポンスをクライアントに返す
        res.json(matches);

    } catch (error) {
        // エラーが発生した場合はエラーメッセージを返す

    }
});

app.get('/leagueEntries', async (req, res) => {
    try {
        // puuidが未定義の場合はエラーを返す
        if (!puuid) {
            throw new Error('puuid is not defined');
        }

        // Riot APIにリクエストを送信
        // 現在のリーグ（ランク）でのサモナー情報
        const response = await axios.get(`https://${platform}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}?api_key=${API_KEY}`);
        const leagueData = response.data;

        // レスポンスをクライアントに返す
        res.json(leagueData);

    } catch (error) {
        // エラーが発生した場合はエラーメッセージを返す

    }
});