import {Request, Response} from 'express';
import Express from 'express';
import "reflect-metadata";
import {createConnection} from "typeorm";
import {User} from "./entity/User";

const app = Express();
const port = 8080; // default port to listen


createConnection().then(async connection => {
    console.log("Inserting a new user into the database...");
    const user = new User();
    user.firstName = "Timber";
    user.lastName = "Saw";
    user.age = 25;
    await connection.manager.save(user);
    console.log("Saved a new user with id: " + user.id);

    console.log("Loading users from the database...");
    const users = await connection.manager.find(User);
    console.log("Loaded users: ", users);

    console.log("Here you can setup and run express/koa/any other framework.");

}).catch(error => console.log(error));

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
