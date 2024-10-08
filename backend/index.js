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

    // Parse the month, defaulting to 3 if not provided or invalid
    const parsedMonth = parseInt(month);

    // Function to check if a string is a valid number
    const isNumeric = (str) => {
        if (typeof str != "string") return false
        return !isNaN(str) && !isNaN(parseFloat(str))
    }

    // Prepare the search criteria
    let searchCriteria = {};

    if (searchText) {
        if (isNumeric(searchText)) {
            // If searchText is a number, search in both price and id fields
            const numericValue = parseFloat(searchText);
            searchCriteria.$or = [
                { price: numericValue },
                { id: Math.floor(numericValue) } // Assuming id is an integer
            ];
        } else {
            // If searchText is not a number, use text search
            searchCriteria.$text = { $search: searchText };
        }
    }

    // Add the month criteria
    searchCriteria.$expr = { $eq: [{ $month: "$dateOfSale" }, parsedMonth] };


    try {
        // Count total transactions matching the search criteria
        const totalTransactions = await ItemModel.countDocuments(searchCriteria);

        // Fetch transactions based on pagination
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


// API for generating data for the bar chart with custom price ranges
app.get('/api/bar-chart/:month', async (req, res) => {
    const month = parseInt(req.params.month);

    if (!month) {
        return res.status(400).json({ error: 'Month is required' });
    }

    // Convert month to integer for comparison (expecting month from 1-12)
    const selectedMonth = parseInt(month, 10);

    try {
        // Aggregation pipeline to group items by price range and count items in each range
        const priceRangeData = await ItemModel.aggregate([
            {
                $match: {
                    $expr: {
                        $eq: [{ $month: '$dateOfSale' }, month]
                    }
                } // Match transactions from the selected month
            },
            {
                $bucket: {
                    groupBy: '$price', // Group items by price
                    boundaries: [0, 101, 201, 301, 401, 501, 601, 701, 801, 901], // Define price range boundaries
                    default: '901 above', // Group items over the highest boundary into "901+"
                    output: {
                        count: { $sum: 1 } // Count number of items in each range
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
                    _id: "$id",
                    category: { $first: "$category" },
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