const mongoose = require('mongoose');

const cryptoSchema = mongoose.Schema({
    name_id: {
        type: String,
        trim: true
    },
    current_price: {
        type: String,
        trim: true
    },
    market_cap: {
        type: String,
        trim: true
    },
    price_change: {
        type: String,
        trim: true
    },
    timeStamp:{
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model("Crypto", cryptoSchema);