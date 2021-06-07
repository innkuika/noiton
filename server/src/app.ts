import {Request, Response} from 'express';
import Express from 'express';
import "reflect-metadata";
import {createConnection, ConnectionOptions} from "typeorm";
import {Block} from "./entity/Block";
import {BlockProperties} from "./entity/BlockProperties";
import {root} from "./path";

const app = Express();
const cors = require('cors')
const port = 8000; // default port to listen
console.log("path: ", `${root}/data/database.sqlite`)
createConnection({
    type: "sqlite",
    database: `${root}/data/database.sqlite`,
    entities: [Block, BlockProperties],
    logging: false,
    synchronize: true,
}).then(async connection => {
    // console.log("Cleaning up database...");
    // await connection.createQueryBuilder().delete().from(Block).execute();

    // console.log("Inserting a new block into the database...");
    // const blockProperties = new BlockProperties();
    // blockProperties.title = "I'm the first block";
    //
    // const block = new Block();
    // block.properties = blockProperties;
    //
    // await connection.manager.save(blockProperties);
    // await connection.manager.save(block);
    //
    // console.log("Saved a new blockProperty with id: " + blockProperties.id, "title: ", blockProperties.title);
    // console.log("Saved a new block with id: " + block.id);

    // let blockRepository = connection.getRepository(Block);
    // console.log("Loading blocks from the database...");
    //
    // const myBlock = await blockRepository.findOne();
    // console.log("Loaded block: ", myBlock);

    // start the express server
    app.listen(port, () => {
        console.log(`server started at http://localhost:${port}`);
    });

    app.use(cors());

// define a route handler for the default home page
    app.get("/page", cors(), async (req: Request, res: Response) => {
        let blockRepository = connection.getRepository(Block);
        const myProperty = await blockRepository.find({relations: ["properties"]})
        console.log("Loaded properties: ", myProperty);
        res.send(JSON.stringify(myProperty));
    });

    app.get("/update-block", cors(), async (req: Request, res: Response) => {

    })

    app.use(function (request, response) {
        response.status(404);
        response.send("Cannot answer this request");
    })


}).catch(error => console.log(error));


