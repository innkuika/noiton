import {Request, Response} from 'express';
import Express from 'express';
import "reflect-metadata";
import {createConnection, ConnectionOptions} from "typeorm";
import {Block} from "./entity/Block";
import {BlockProperties} from "./entity/BlockProperties";
import {root} from "./util/path";
import {blockType, quickTitle} from "../../client/src/shared/util";
import {depthFirstTraversal} from "./treeOperations";
import {v4 as uuidv4} from 'uuid';
const bodyParser = require('body-parser')
const cors = require('cors')

const app = Express();
const jsonParser = bodyParser.json() // create application/json parser
const port = 8000; // default port to listen
const rootPageId = "root_page" // id of root page

createConnection({
    type: "sqlite",
    database: `${root}/data/database.sqlite`,
    entities: [Block, BlockProperties],
    logging: false,
    synchronize: true,
}).then(async connection => {
    console.log("Cleaning up database...");
    await connection.createQueryBuilder().delete().from(Block).execute();

    // console.log("Inserting block to db")
    // const block1id = uuidv4();
    // const blockProperties1 = new BlockProperties();
    // blockProperties1.title =  quickTitle("child block")
    // const block1 = new Block();
    // block1.properties = blockProperties1;
    // block1.uuid = block1id
    // block1.type = blockType.text;
    // block1.content = []
    // block1.parent = ""
    // await connection.manager.save(block1);


    console.log("Creating the root page...");
    const blockProperties = new BlockProperties();
    blockProperties.title =  quickTitle("root page")

    const block = new Block();
    block.properties = blockProperties;
    block.uuid = rootPageId;
    block.type = blockType.page;
    // block.content = [block1id]
    block.content = []
    block.parent = ""
    await connection.manager.save(block);

    console.log("Saved a new blockProperty with id: " + blockProperties.id, "title: ", blockProperties.title);
    console.log("Saved a new block with uuid: " + block.uuid);


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


    app.get("/page", cors(), async (req: Request, res: Response) => {
        const pageUuid = req.query.uuid as string
        let blocks = await depthFirstTraversal(pageUuid, blockRepository)

        // console.log("Loaded blocks: ", blocks);
        res.send(JSON.stringify(blocks));
    });

    app.put("/update-block", cors(), jsonParser, async (req: Request, res: Response) => {
        // TODO: handle error
        // only updates title now
        console.log("updating block...")
        const uuid = req.body.uuid
        const blockToUpdate = await blockRepository.findOne(uuid, {relations: ["properties"]});
        blockToUpdate.properties.title = req.body.title;
        await blockRepository.save(blockToUpdate);
        res.status(200);
        res.send({block_updated: uuid})
        console.log("finished updating block...")
    })

    app.post("/post-block", cors(), jsonParser, async (req: Request, res: Response) => {
        // insert new block to db
        console.log("saving new block to db...")
        const insert_after_uuid: string = req.body.after_uuid;
        const uuid = req.body.uuid;
        const type = req.body.type;
        const parentUuid = req.body.parent;
        const blockProperties = new BlockProperties();
        blockProperties.title = req.body.title;

        const block = new Block();
        block.properties = blockProperties;
        block.uuid = uuid;
        block.type = type
        block.parent = parentUuid
        block.content = []
        await connection.manager.save(block);

        // find parent and add to parent's content
        const parentBlock = await blockRepository.findOne(parentUuid)
        const parentContent = parentBlock.content
        let newContent = [...parentContent]

        if (insert_after_uuid === null || parentContent.length === 0) {
            // it's the first child
            newContent.unshift(uuid)
        } else {
            for(let i = 0; i < parentContent.length; i++){
                if (insert_after_uuid === parentContent[i]){
                    // spice won't throw even i+1 > parentContent.length
                    newContent.splice(i+1, 0, uuid)
                    break
                }
            }
        }

        parentBlock.content = newContent
        await connection.manager.save(parentBlock);
        res.status(200);
        res.send({block_posted: uuid})
    })

    app.use(function (request, response) {
        response.status(404);
        response.send("Cannot answer this request");
    })


}).catch(error => console.log(error));


