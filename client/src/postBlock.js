import {v4 as uuidv4} from 'uuid';
import {ContentState, convertToRaw} from "draft-js";
import {blockType} from "./shared/util";
import {post} from "./useAsyncFetch";

const postBlock = (insertAfterUuid, pageData, setPageData, depth, parentUuid) => {
    const path = "/post-block"
    const uuid = uuidv4();

    // update pageData here, this will only change data in the front end
    let newPageData = [...pageData];
    const contentState = ContentState.createFromText("New Block")
    const title = JSON.stringify(convertToRaw(contentState))
    const frontendBlockData = {
        uuid: uuid,
        depth: depth,
        properties: {
            title: title
        },
        type: blockType.text,
        parent: parentUuid,
        content: []
    }

    if (insertAfterUuid === null) {
        newPageData.splice(1, 0, frontendBlockData)
    } else {
        for (let i = 0; i < pageData.length; i++) {
            if (insertAfterUuid === pageData[i].uuid) {
                // spice won't throw even i+1 > props.pageData.length
                newPageData.splice(i + 1, 0, frontendBlockData)
                break
            }
        }
    }

    setPageData(newPageData);

    // make call to db to insert block
    const backendBlockData = {
        after_uuid: insertAfterUuid,
        uuid: uuid,
        title: title,
        type: blockType.text,
        parent: parentUuid,
    }

    post(path, () => {
    }, () => {
    }, backendBlockData)

    return newPageData
}

const getBlockIndex = (pageData, blockUuid) => {
    // return block index, return null if not found
    let index = null;
    for(let i = 0; i < pageData.length; i++) {
        if (pageData[i].uuid === blockUuid) {
            index = i;
            break;
        }
    }
    return index
}


export {postBlock, getBlockIndex}
