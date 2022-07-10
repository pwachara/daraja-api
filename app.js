const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios')
const app = express()

app.use(bodyParser.json())

//Routes

app.get('/', (req, res) => {
    res.send('Hello World')
})

app.get('/access-token', getAccessToken, (req, res)=> {
    res.json({ access_token: req.access_token})
})

//STK - LNMO

app.get('/stk', getAccessToken, (req, res, next) => {
    let endpoint = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
    let auth = "Bearer " + req.access_token

    let datenow = new Date()

    const appTimestamp = datenow.getFullYear() + "" 
                        + "07"
                        + datenow.getDate() + "" 
                        + datenow.getHours() + ""
                        + datenow.getMinutes() + "" 
                        + datenow.getSeconds()

    const appPassword = Buffer.from("174379" + "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919" + appTimestamp).toString("base64") 

    let data = {

            "BusinessShortCode": 174379,
            "Password": appPassword,
            "Timestamp": appTimestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": 1,
            "PartyA": "254722210188",
            "PartyB": 174379,
            "PhoneNumber": "254722210188",
            "CallBackURL": "https://208d-154-154-207-176.in.ngrok.io/stk-callback",
            "AccountReference": "CompanyXLTD",
            "TransactionDesc": "Payment of X" 
    }

    axios({
        method: "post", 
        url: endpoint,
        headers: {
            "Authorization": auth
        },
        data: data
    })
    .then(response => {
        console.log(response.data)
        res.send(response.data)
        //req.access_token = response.data.access_token

        next()
    })
    .catch(error => console.log(error))



})

app.post('/stk-callback', (req, res) => {
    console.log("=======================STK======================")
    console.log("MERCHANT REQUEST ID IS ", req.body.Body.stkCallback.MerchantRequestID)
    console.log("CHECKOUT REQUEST ID IS ", req.body.Body.stkCallback.CheckoutRequestID)
    console.log("CALLBACKMETADATA IS ", req.body.Body.stkCallback.CallbackMetadata)
})

function getAccessToken(req, res, next){

    let url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    let auth = Buffer.from("Mrx5jf0G9Zs3GITSaKrS1BTSGhXRaiAM:1HkEh3RfTftQA5bA").toString('base64')


    axios({
        method: "get", 
        url: url,
        headers: {
            "Authorization": "Basic " + auth
        }
    })
    .then(response => {
        console.log(response.data)
        res.send(response.data)
        req.access_token = response.data.access_token

        next()
    })
    .catch(error => console.log(error))
}


//Listen
app.listen(3000)