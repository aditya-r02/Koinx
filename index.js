const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const Crypto = require('./models/Crypto');

// Allow cross origin  
const cors = require('cors');
const options = { 
    origin: '*',
    }
app.use(cors(options));

// Connect to database
const connect = require('./services/database.js');
connect();

app.use(express.json());

// Server starting on port 3000
app.listen(PORT, ()=>{
    console.log(`Server is listening on port ${PORT}`)
})

app.get('/', (req, res) => {
    return res.send("hello world!")
})

const fetchDetail = async(crypto) => {
    try{
        const url = `https://api.coingecko.com/api/v3/coins/${crypto}?localization=false&tickers=false&community_data=false&developer_data=false&x_cg_demo_api_key=${process.env.COINGECKO_API}`;
        const response = await fetch(url);
        const data = await response.json();

        await Crypto.create({name_id: crypto, current_price: data.market_data.current_price.usd, market_cap: data.market_data.market_cap.usd, price_change: data.market_data.price_change_24h, timeStamp: Date.now()});
    }
    catch(error) {
        return;
    }
}

const fetchCryptoDetails = async() => {
    try{ 
        fetchDetail('bitcoin');
        fetchDetail('matic-network');
        fetchDetail('ethereum');

        const cnt = await Crypto.countDocuments();
        
        if (cnt>300) {
            await Crypto.deleteMany({}, { limit: 3, sort: { createdAt: 1 } });
        }
    }
    catch(error) {
        console.log(error);
    }
}

setInterval(fetchCryptoDetails, 60*1000)

app.get("/stats", async (req, res) =>{
    try {
        const coin = req.query.coin;

        if (!(coin==='bitcoin'||coin==='matic-network'||coin==='ethereum'))
            return res.status(500).json({
                success: false,
                detail: "Invalid coin"
            })

        const details = await Crypto.find({name_id:coin}).sort({timeStamp:-1}).limit(1);
        console.log(details)
        return res.status(200).json({
            price: details[0].current_price,
            marketCap: details[0].market_cap,
            "24hChange": details[0].price_change
        })
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            detail:"Some erorr occured"
        })
    }
})

app.get("/deviation", async (req, res) =>{
    try {
        const coin = req.query.coin;

        if (!(coin==='bitcoin'||coin==='matic-network'||coin==='ethereum'))
            return res.status(500).json({
                success: false,
                detail: "Invalid coin"
            })

        const details = await Crypto.find({name_id:coin});
        let n = details.length;
        let sum = 0;
        
        details.map((detail) => {
            let curr = Number(detail.current_price);
            sum += curr;
        })

        const meanVal = sum/n;

        let ans = 0;

        details.map((detail)=>{
            let curr = Number(detail.current_price);
            let diff = meanVal - curr;
            ans += diff*diff;
        })

        ans = ans/n;

        ans = Math.sqrt(ans);
        
        return res.status(200).json({
            deviation: ans
        })
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            detail:"Some erorr occured"
        })
    }
})

// const deleteRecord = async() => {
//     await Crypto.deleteMany({});
// }
// deleteRecord();