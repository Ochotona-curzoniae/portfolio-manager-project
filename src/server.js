import express from 'express'
import mysql from 'mysql2'
import overviewRouter from './overview.js'
import portfolioRouter from './portfolio.js'

const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use('/api', overviewRouter)
app.use('/api/portfolio', portfolioRouter)
console.log(app);
app.get('/api/networth/:days', async (req, res) => {
    try {
      // 3. .THEN/.CATCH EXAMPLE: Alternative to async/await
      const { days } = req.params;
        res.json({
            "total":2317371,
            "changeToday":3402,
            "history":[
                { date: '2024-06-29', value: 2100000 },
                { date: '2024-06-30', value: 2100000 },
                { date: '2024-07-01', value: 2100000 },
                { date: '2024-07-02', value: 2100000 },
                { date: '2024-07-03', value: 2100000 },
                { date: '2024-07-04', value: 2100000 },
                { date: '2024-07-05', value: 2100000 },
                { date: '2024-07-06', value: 2100000 },
                { date: '2024-07-07', value: 2100000 },
                { date: '2024-07-08', value: 2100000 },
                { date: '2024-07-09', value: 2100000 },
                { date: '2024-07-10', value: 2100000 },
                { date: '2024-07-11', value: 2100000 },
                { date: '2024-07-12', value: 2100000 },
                { date: '2024-07-13', value: 2100000 },
                { date: '2024-07-14', value: 2100000 },
                { date: '2024-07-15', value: 2100000 },
                { date: '2024-07-16', value: 2100000 },
                { date: '2024-07-17', value: 2100000 },
                { date: '2024-07-18', value: 2100000 },
                { date: '2024-07-19', value: 2100000 },
                { date: '2024-07-20', value: 2100000 },
                { date: '2024-07-21', value: 2100000 },
                { date: '2024-07-22', value: 2100000 },
                { date: '2024-07-23', value: 2050000 },
                { date: '2024-07-24', value: 2100000 },
                { date: '2024-07-25', value: 2150000 },
                { date: '2024-07-26', value: 2200000 },
                { date: '2024-07-27', value: 2250000 },
                { date: '2024-07-28', value: 2317371 }
              ]
        })
    } catch (err) {
      next(err);
    }
  });
  app.get('/', async (req, res) => {
    try {
      console.log("hello hello")
      res.json({
        "name": "success"
      })
    } catch (err) {
      next(err);
    }
  });
app.listen(3000, () => console.log('running on http://localhost:3000'));
