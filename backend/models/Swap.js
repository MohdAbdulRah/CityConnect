const mongoose = require("mongoose");


const swapSchema = mongoose.Schema({
    user : {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
    },
    contains : {
        type : String,
        required : true,
        enum: ["cash", "online"],
        default: "cash"
    },
    amount : {
        type : Number,
        required : true
    },
    reciever : {
         type: mongoose.Schema.Types.ObjectId,
          ref: "Swap",
          default: null,
    },
    swapCoordinates : {
        type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    }
})

swapSchema.index({"swapCoordinates" : "2dsphere"})
const Swap = mongoose.model('Swap',swapSchema)

module.exports = Swap