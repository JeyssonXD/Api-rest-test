import express from "express";
import sol from "request-promise";
import { parseString } from "xml2js";
require('dotenv').config();

import authenticate from '../middlewares/authenticate';

const router = express.Router();

router.use(authenticate);

router.get("/search",(req,res)=>{
    sol.get(`https://www.goodreads.com/search/index.xml?key=${process.env.KEY_GOODREADAPI}&q=${req.query.q}`)
    .then(result => parseString(result, (err,goodreadsResult)=>{
        res.json({ books : goodreadsResult.GoodreadsResponse.search[0].results[0].work.map(work=>({
                    goodreadsId: parseInt(work.best_book[0].id[0]._),
                    title: work.best_book[0].title[0],
                    authors: work.best_book[0].author[0].name[0],
                    covers: [work.best_book[0].image_url[0]],
                    pages:0
                }))
        })
    })
    );
});

export default router;
