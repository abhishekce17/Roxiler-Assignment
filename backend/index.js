require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors")
const connectToMongo = require("./db");
const port = 5000;
connectToMongo();

const ItemModel = require("./models/Items");

const app = express();
app.use(cors());
// app.use(cors({ origin: process.env.FRONTEND_URI }));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.get("/api/initialize-database-with-seed-data", async (req, res) => {
    const response = await fetch("https://s3.amazonaws.com/roxiler.com/product_transaction.json");
    const seedData = await response.json();
    ItemModel.insertMany(seedData);
    return res.json({ msg: "Seed data added to the DB   " });
})



app.get('/api/transactions', async (req, res) => {
    const { page = 1, perPage = 10, searchText = '', month } = req.query;

    const parsedMonth = parseInt(month);

    const isNumeric = (str) => {
        if (typeof str != "string") return false
        return !isNaN(str) && !isNaN(parseFloat(str))
    }

    let searchCriteria = {};

    if (searchText) {
        if (isNumeric(searchText)) {
            const numericValue = parseFloat(searchText);
            searchCriteria.$or = [
                { price: numericValue },
                { id: Math.floor(numericValue) }
            ];
        } else {
            searchCriteria.$text = { $search: searchText };
        }
    }

    searchCriteria.$expr = { $eq: [{ $month: "$dateOfSale" }, parsedMonth] };


    try {
        const totalTransactions = await ItemModel.countDocuments(searchCriteria);

        const transactions = await ItemModel.find(searchCriteria)
            .skip((page - 1) * perPage)
            .limit(parseInt(perPage))
            .sort("id")
            .exec();


        return res.json({
            total: totalTransactions,
            page: parseInt(page),
            perPage: parseInt(perPage),
            transactions,
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get('/api/statistics/:month', async (req, res) => {
    const month = parseInt(req.params.month);

    if (!month) {
        return res.status(400).json({ error: 'Month is required' });
    }
    try {
        const totalSalesData = await ItemModel.aggregate([
            {
                $match: {
                    $expr: { $eq: [{ $month: "$dateOfSale" }, month] },
                    sold: true // Only sold items
                }
            },
            {
                $group: {
                    _id: null,
                    totalSaleAmount: { $sum: "$price" },
                    totalSoldItems: { $sum: 1 }
                }
            }
        ]).exec();


        const totalNotSoldItems = await ItemModel.countDocuments({
            $expr: { $eq: [{ $month: "$dateOfSale" }, month] },
            sold: false // Not sold items
        });

        return res.json({
            totalSaleAmount: totalSalesData[0].totalSaleAmount || 0,
            totalSoldItems: totalSalesData[0].totalSoldItems || 0,
            totalNotSoldItems,
        });

    } catch (error) {
        console.error('Error fetching statistics:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get('/api/bar-chart/:month', async (req, res) => {
    const month = parseInt(req.params.month);

    if (!month) {
        return res.status(400).json({ error: 'Month is required' });
    }

    const selectedMonth = parseInt(month, 10);

    try {
        const priceRangeData = await ItemModel.aggregate([
            {
                $match: {
                    $expr: {
                        $eq: [{ $month: '$dateOfSale' }, month]
                    }
                }
            },
            {
                $bucket: {
                    groupBy: '$price',
                    boundaries: [0, 101, 201, 301, 401, 501, 601, 701, 801, 901],
                    default: 'above 901',
                    output: {
                        count: { $sum: 1 }
                    }
                }
            }
        ]).exec();

        return res.json({
            month: selectedMonth,
            priceRangeData
        });
    } catch (error) {
        console.error('Error fetching bar chart data:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get('/api/pie-chart-category/:month', async (req, res) => {
    try {
        const month = parseInt(req.params.month);

        if (!month) {
            return res.status(400).json({ error: 'Month is required' });
        }

        const categoryData = await ItemModel.aggregate([
            {
                $match: {
                    $expr: { $eq: [{ $month: "$dateOfSale" }, month] }
                }
            },
            {
                $group: {
                    _id: "$category",
                    // category: { $first: "$category" },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        return res.json(categoryData);
    } catch (error) {
        console.error('Error fetching category chart date:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get("/api/analytics", async (req, res) => {
    try {
        const month = parseInt(req.query.month);
        if (!month) {
            return res.status(400).json({ error: 'Month is required' });
        }
        const [statistics, barChart, pieChart] = await Promise.all([
            fetch(`${process.env.BACKEND_URI}/api/statistics/${month}`),
            fetch(`${process.env.BACKEND_URI}/api/bar-chart/${month}`),
            fetch(`${process.env.BACKEND_URI}/api/pie-chart-category/${month}`),
        ]);
        return res.json({ statistics: await statistics.json(), barChart: await barChart.json(), pieChart: await pieChart.json() });
    } catch (error) {
        console.error('Error fetching analytics :', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
})

app.listen(port, function (err) {
    if (!err) {
        console.log("server is running on port " + port);
    } else {
        console.error(err);
    }
})
