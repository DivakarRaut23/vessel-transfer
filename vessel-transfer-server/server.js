const express = require('express');
const cors = require("cors");
const storage = require('node-persist');
const bodyParser = require("body-parser");
const { request, response } = require('express');
const { v4: uuidv4 } = require('uuid');
const vesselTransfers = require('./vesselTransfer.json');


(async () => {

    await storage.init({ dir: './data' });

    // for(let t of vesselTransfers){await storage.setItem(t.id.toString(),t);}
    const server = express();
    server.use(cors());
    server.use(express.json());
    server.use(bodyParser.json());

    server.get('/transfers', async (request, response) => {
        let transfers = await storage.valuesWithKeyMatch(/transfer-/);
        response.json(transfers);
    });

     //GET request to filter by hin number
     server.get("/transfers/:hin", async(request, response) => {
        let transfer = await storage.valuesWithKeyMatch(/transfer-/);
        let hin = request.params.hin;
        let filteredtransfer = transfer.filter((t) => t.hin == hin)

        response.json(filteredtransfer);
    })

    server.get('/transfers/:id', async (request, response) => {
        let transfer = await storage.getItem(`transfer-${request.params.id}`);
        if (transfer == undefined) {
            response.json({ status: 400, message: 'Invalid transfer Id Provided' });
            return;
        } else {
            response.json(transfer);
        }


    });

    server.post('/transfers', async (request, response) => {
        try {

            
            let transfer = {
                id: uuidv4(),
                transferDate: new Date().toISOString().slice(0, 10),
                ...request.body
            };
            await storage.setItem(`transfer-${transfer.id}`, transfer);
            response.json({  transfer, status: 200 });
        }
        catch (error) {
            response.json({ status: 500, message: error.message });
        }

    });

    server.put('/transfers', async (request, response) => {
        try {
            let id = request.body.id;
            let key = `transfer-${id}`;
            let result = await storage.updateItem(key, request.body);
            response.json(result.content.value);
        }
        catch (error) {
            response.json({ status: 500, message: error.message });
        }

    });

    server.delete('/transfers', async (request, response) => {
        try {
            let id = request.body.id;
            let key = `transfer-${id}`;
            let updateTransfer = await storage.removeItem(key);
            response.json(updateTransfer.content.value);
        }
        catch (error) {
            response.json({ status: 500 });
        }

    });


    const PORT = process.env.PORT || 4000;

    server.listen(PORT, () => {
        console.log(`The server is up and running and listening on port: ${PORT}`);
    })




})();









