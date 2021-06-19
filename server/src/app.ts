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
    blockProperties.title = quickTitle("root page")

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

    const updateBlock = async (uuid: string, title: string, parent: string, content: [string], res: Response) => {
        // TODO: handle error
        // const uuid = req.body.uuid
        const blockToUpdate = await blockRepository.findOne(uuid, {relations: ["properties"]});
        if (title === undefined) {
            blockToUpdate.properties.title = title;
        }
        if (parent === undefined) {
            blockToUpdate.parent = parent;
        }
        if (content === undefined) {
            blockToUpdate.content = content
        }
        await blockRepository.save(blockToUpdate);
    }

    app.put("/update-block", cors(), jsonParser, async (req: Request, res: Response) => {
        console.log("updating block...")
        await updateBlock(req.body.uuid, req.body.title, undefined, undefined, res)
        res.status(200);
        res.send({block_updated: req.body.uuid})
        console.log("finished updating block...")
    })


    app.put("/move-block", cors(), jsonParser, async (req: Request, res: Response) => {
        console.log("moving block...")
        const {fromUuid, toUuid, moveUuid, fromUuidContent, toUuidContent} = req.body

        await updateBlock(fromUuid, undefined, undefined, fromUuidContent, res)
        await updateBlock(toUuid, undefined, undefined, toUuidContent, res)
        await updateBlock(moveUuid, undefined, toUuid, undefined, res)

        res.status(200);
        res.send({block_moved: moveUuid})
        console.log("finished moving block...")
    })


    app.post("/post-block", cors(), jsonParser, async (req: Request, res: Response) => {
        // insert new block to db
        console.log("saving new block to db...")
        const {uuid, type, parent, after_uuid} = req.body
        const blockProperties = new BlockProperties();
        blockProperties.title = req.body.title;

        const block = new Block();
        block.properties = blockProperties;
        block.uuid = uuid;
        block.type = type
        block.parent = parent
        block.content = []
        await connection.manager.save(block);

        // find parent and add to parent's content
        const parentBlock = await blockRepository.findOne(parent)
        const parentContent = parentBlock.content
        let newContent = [...parentContent]

        if (after_uuid === null || parentContent.length === 0) {
            // it's the first child
            newContent.unshift(uuid)
        } else {
            for (let i = 0; i < parentContent.length; i++) {
                if (after_uuid === parentContent[i]) {
                    // spice won't throw even i+1 > parentContent.length
                    newContent.splice(i + 1, 0, uuid)
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


