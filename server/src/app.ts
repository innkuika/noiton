import {Request, Response} from 'express';
import Express from 'express';
import "reflect-metadata";
import {createConnection, ConnectionOptions} from "typeorm";
import {Block} from "./entity/Block";
import {BlockProperties} from "./entity/BlockProperties";
import {root} from "./path";
import { v4 as uuidv4 } from 'uuid';

const app = Express();
const cors = require('cors')
const bodyParser = require('body-parser')
// create application/json parser
const jsonParser = bodyParser.json()
const port = 8000; // default port to listen
console.log("path: ", `${root}/data/database.sqlite`)
createConnection({
    type: "sqlite",
    database: `${root}/data/database.sqlite`,
    entities: [Block, BlockProperties],
    logging: false,
    synchronize: true,
}).then(async connection => {
    console.log("Cleaning up database...");
    await connection.createQueryBuilder().delete().from(Block).execute();

    // console.log("Inserting a new block into the database...");
    // const blockProperties = new BlockProperties();
    // blockProperties.title = "I'm the second block";
    //
    // const block = new Block();
    // block.properties = blockProperties;
    // block.uuid = uuidv4();
    // await connection.manager.save(blockProperties);
    // await connection.manager.save(block);
    //
    // console.log("Saved a new blockProperty with id: " + blockProperties.id, "title: ", blockProperties.title);
    // console.log("Saved a new block with uuid: " + block.uuid);

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

    let blockRepository = connection.getRepository(Block);
    // let blockPropertiesRepository = connection.getRepository(BlockProperties);

    // define a route handler for the default home page
    app.get("/page", cors(), async (req: Request, res: Response) => {
        const blocks = await blockRepository.find({relations: ["properties"]})
        // console.log("Loaded blocks: ", blocks);
        res.send(JSON.stringify(blocks));
    });

    app.put("/update-block", cors(), jsonParser, async (req: Request, res: Response) => {
        // TODO: handle error
        // only updates title now
        console.log("updating block...")
        const uuid = req.body.uuid
        const blockToUpdate = await blockRepository.findOne(uuid,{relations: ["properties"]});
        blockToUpdate.properties.title = req.body.title;
        await blockRepository.save(blockToUpdate);
        res.status(200);
        res.send({blockUpdated: uuid})
        console.log("finished updating block...")
    })

    app.post("/post-block", cors(), jsonParser, async (req: Request, res: Response) => {
        // insert new block to db
        console.log("saving new block to db...")
        const insert_after_uuid: string = req.body.after_uuid;
        const uuid = req.body.uuid;
        const blockProperties = new BlockProperties();
        blockProperties.title = req.body.title;

        const block = new Block();
        block.properties = blockProperties;
        block.uuid = uuid;
        await connection.manager.save(block);
        res.status(200);
        res.send({blockPosted: uuid})
        console.log("finished saving new block to db")
    })

    app.use(function (request, response) {
        response.status(404);
        response.send("Cannot answer this request");
    })


}).catch(error => console.log(error));


