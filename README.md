# Noiton

Steps to run this project:
1. Run `npm i` command
2. Setup database settings inside `ormconfig.json` file
3. Run `npm start` command

## APIs
### GET `/page`

Gets an array of `block` objects that are child of the `page`.
For now we assume there's only one page, the page uuid is hardcoded.

#### Arguments

| Argument | Description                                       |
|----------|---------------------------------------------------|
| uuid | The uuid of the page |

#### Response object

| Key        | Description                          |
|------------|--------------------------------------|
| blocks | (Array) The `block`s            |


### PUT `/update-block`

Updates the title of a `block`.

#### Arguments

| Argument | Description                                       |
|----------|---------------------------------------------------|
| uuid | The uuid of the block to update |
| title | The new title of the block |

#### Response object

| Key        | Description                          |
|------------|--------------------------------------|
| block_updated | The uuid of the block updated  |


### POST `/post-block`

Posts a new `block` with empty content.

#### Arguments

| Argument | Description                                       |
|----------|---------------------------------------------------|
| uuid | The uuid of the block to be posted (generated in frontend) |
| type | The type of the block |
| after_uuid | The uuid of the block that goes before the new block, `null` if it's the first child of parent |
| parent | The uuid of the block's parent |
| title | The title of the new block |

#### Response object

| Key        | Description                          |
|------------|--------------------------------------|
| block_posted | The uuid of the block posted  |







