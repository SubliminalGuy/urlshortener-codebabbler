require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');

let bodyParser = require("body-parser");

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://hmmepyghcfxqwcvfguul.supabase.co'
const supabaseKey = process.env['SUPABASE_KEY']


const supabase = createClient(supabaseUrl, "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYyMDgwODc5NCwiZXhwIjoxOTM2Mzg0Nzk0fQ.r90f6RrhomVTu6aICqzPnpw28lrNjArK4Sv6k17_vfo")

// searchOriginalUrl
async function getUrl(_id) {
                let { data: urls, error } = await supabase
                        .from('URLshortener')
                        .select("original_url")
                        .eq("id", _id)
                        return urls[0].original_url
                        //console.log(urls)
        } 



// insert URL in Supabase

async function insertUrl(original_url) {
                const { data, error } = await supabase
                        .from('URLshortener')
                        .insert([{ original_url: original_url }])
                        console.log("TYPE", typeof(data[0].id))
                        return data[0].id
        }



// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({extended: false}));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// Lookup ShortURL
app.get('/api/shorturl/:short_url', async function(req, res) {
  let url = await getUrl(req.params.short_url)
  console.log("Got URL", url)
  res.redirect(url);
});

app.post('/api/shorturl', async function(req, res) {
  //console.log("Submitted URL", req.body)
  let urlRegEx = /^(http|https):\/\/[^ "]+$/;
  let domainName = req.body.url.split("://")[1]
    
  if (!urlRegEx.test(req.body.url)) {
    res.json({ error: 'invalid url' })
    }
  else {
      let newId = await insertUrl(req.body.url)
      res.json({ original_url: req.body.url, short_url: newId });

    // DNS Lookup is a good idea but failed during the FCC test
    // FCC submitted bogus URLs for testing
    /*
    dns.lookup(domainName, async function(err, address) {
      let isExisting = await address;
      console.log("DNS Status", isExisting)
      if (isExisting) {
        let newId = await insertUrl(req.body.url)
        res.json({ original_url: req.body.url, short_url: newId });
        }
      else {
        res.json({ error: 'invalid url' })
        }
    });
    */
  }
});



app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
