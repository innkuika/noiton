import {Request, Response} from 'express';
import Express from 'express';
import "reflect-metadata";

const app = Express();
const port = 8080; // default port to listen

// define a route handler for the default home page
app.get("/", (req: Request, res: Response) => {
    // render the index template
    res.send("index");
});

// start the express server
app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`server started at http://localhost:${port}`);
});
