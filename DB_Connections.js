const mongoose = require('mongoose')
async function Connect_DB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB Connected");
    }
    catch (error) {
        console.log("error: " + error)
    }
}
module.exports = { Connect_DB };