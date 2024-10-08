const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
    id: {
        type: Number,
    },
    price: {
        type: Number
    },
    title: {
        type: String,
    },
    image: {
        type: String
    },
    dateOfSale: {
        type: mongoose.SchemaTypes.Date,
    },
    description: {
        type: String,
    },
    category: {
        type: String,
    },
    sold: {
        type: Boolean,
    }
})

ItemSchema.index({ title: "text", description: "text" });
ItemSchema.index({ price: 1 });
ItemSchema.index({ dateOfSale: 1 });

module.exports = mongoose.model("Item", ItemSchema);