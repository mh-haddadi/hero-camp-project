const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path'); // برای پیدا کردن فایل اچ تی ام ال

const app = express();
const port = 1100;

app.use(express.static(__dirname));
app.use(express.json());

const pool = mysql.createPool({
  host: 'localhost',
  port: 3307,
  user: 'root',
  password: '',
  database: 'a',
  waitForConnections: true,
  connectionLimit: 5
});

app.post('/add-hero', async (req,res) => {
  const { name , power } = req.body;

  if (!name || name.length < 2) {
    return res.status(400).json({message: '❗ نام حداقال باید 3 کارکتر باشد'});
  }
  if(!power || isNaN(power) || power < 1 || power > 100) {
    return res.status(400).json({message: '❗ قدرت باید بین 1 تا 100 باشد'});
  }

  try{
    //  دستور مای اس کیو ال برای ذخیره ساده
    const [result] = await pool.query(
      'INSERT INTO heros (user, power) VALUES (?,?)',
      [name.trim(), power]
    );

    res.status(201).json({ message: `🦸 ${name} با قدرت ${power} به اردوگاه پیوست!` });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'خطای سرور!' });
    }
});

app.get('/heros', async (req,res) => {
  
  try{
    const [rows] = await pool.query('SELECT * FROM heros ORDER BY id DESC LIMIT 20');
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({message: 'خطا در دریافت لیست'});
  }

});

app.listen(port, () => {
    console.log(`⚔️ اردوگاه قهرمانان روی پورت ${port} برپا شد!`);
});