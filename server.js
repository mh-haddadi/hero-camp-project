const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path'); // برای پیدا کردن فایل اچ تی ام ال

const app = express();
const port = 1100;

app.use(express.static(__dirname)); // همه فایل‌های استاتیک (HTML, CSS, JS) رو از پوشه جاری سرویس
app.use(express.json());

const pool = mysql.createPool({
  host: 'localhost',
  port: 3307,
  user: 'root',
  password: '',
  database: 'a',
  waitForConnections: true,  // اگر همه اتصالات مشغول بودن، درخواست جدید منتظر میمونه
  connectionLimit: 5 // حداکثر ۵ اتصال همزمان مجاز هست
});

app.post('/add-hero', async (req,res) => {
  const { name , power } = req.body;  // نام و قدرت رو از بدنه درخواست استخراج میکنه

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
      [name.trim(), power]  // مقادیر رو با trim کردن نام وارد میکنه
    );

    res.status(201).json({ message: `🦸 ${name} با قدرت ${power} به اردوگاه پیوست!` });

    } catch (err) {  // خطا رو در کنسول لاگ میکنه
        console.error(err);
        res.status(500).json({ message: 'خطای سرور!' });
    }
});

app.get('/heros', async (req,res) => {  // اندپوینت GET برای دریافت لیست قهرمانان
  
  try{
    const [rows] = await pool.query('SELECT * FROM heros ORDER BY id DESC LIMIT 20');  // کوئری SELECT میزنه و ۲۰ تا آخرین قهرمان رو برمیگردونه
    //  
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({message: 'خطا در دریافت لیست'});
  }

});

app.listen(port, () => {
    console.log(`⚔️ اردوگاه قهرمانان روی پورت ${port} برپا شد!`);
});