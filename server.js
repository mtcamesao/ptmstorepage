
if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const stripe = require('stripe')('sk_test_51IYm1fBpMfOBdhUZ7DZQ7PDWvvUBItR2pezfd1eFnS0ehmAdpfcCNaGsThwOwONZmh12aoYMJE9DXlgfFKmOPcsY00OYln2K6g');
const express = require('express');
const fs = require('fs')
const app = express();
const RconClient = require('rcon-client');
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY;
const endpointSecret = process.env.END_POINT_SECRET;


const rcon = new RconClient.Rcon({
    host: "localhost",
    port: 25575,
    password: "abc123"
}).connect().then(function(){
    console.log('rcon connected')
}).catch(function(error){
    console.log('Something went wrong'+error)
})



const YOUR_DOMAIN = 'http://localhost:9000';

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());


app.get('/', function(req, res) {
    fs.readFile('items.json', function(error, data){
        if(error){
            res.status(500).end();
        }else{
            res.render('index.ejs', {
                items: JSON.parse(data)
            });
        }
    })
    
})

app.get('/success', function(req, res) {
    res.render('success.ejs')
})

app.post('/checkout', async (req, res) => {
    console.log('username: '+req.body.username)
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
        {
            price_data: {
            currency: 'usd',
            product_data: {
                name: 'Stubborn Attachments',
                images: ['https://i.imgur.com/EHyR2nP.png'],
            },
            unit_amount: 2000,
        },
            quantity: 1,
        },
        ],
            mode: 'payment',
            success_url: `${YOUR_DOMAIN}/success?=${req.body.username}`,
            cancel_url: `${YOUR_DOMAIN}/cancel`,
        });
    res.json({ id: session.id });    
});

const createOrder = (session) => {
    // TODO: fill me in
    console.log("Creating order", session);
}

const emailCustomerAboutFailedPayment = (session) => {
    // TODO: fill me in
    console.log("Emailing customer", session);
}

const fulfillOrder = (session) => {
    // TODO: fill me in
    console.log("Fulfilling order", session);
    console.log('IT WORKED!');
}

app.post('/webhook', (request, response) => {
    const payload = request.body;
    const sig = request.headers['stripe-signature'];
  
    let event;
  
    try {
      event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err) {
      return response.status(400).send(`Webhook Error: ${err.message}`);
    }
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        // Save an order in your database, marked as 'awaiting payment'
        createOrder(session);
  
        // Check if the order is paid (e.g., from a card payment)
        //
        // A delayed notification payment will have an `unpaid` status, as
        // you're still waiting for funds to be transferred from the customer's
        // account.
        if (session.payment_status === 'paid') {
          fulfillOrder(session);
        }
  
        break;
      }
  
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object;
  
        // Fulfill the purchase...
        fulfillOrder(session);
  
        break;
      }
  
      case 'checkout.session.async_payment_failed': {
        const session = event.data.object;
  
        // Send an email to the customer asking them to retry their order
        emailCustomerAboutFailedPayment(session);
  
        break;
      }
    }
        response.status(200);
});
  



app.listen(9000, () => console.log('Running on port 9000'));