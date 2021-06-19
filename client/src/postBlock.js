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

    // add block to parent content
    const parent = getBlockByUuid(newPageData, parentUuid)
    const parentContent = parent.content

    let newContent = [...parentContent]

    if (insertAfterUuid === null || parentContent.length === 0) {
        // it's the first child
        newContent.unshift(uuid)
    } else {
        for (let i = 0; i < parentContent.length; i++) {
            if (insertAfterUuid === parentContent[i]) {
                // spice won't throw even i+1 > parentContent.length
                newContent.splice(i + 1, 0, uuid)
                break
            }
        }
    }
    parent.content = newContent

    if (insertAfterUuid === null) {
        for (let i = 0; i < pageData.length; i++) {
            if (parentUuid === pageData[i].uuid) {
                // spice won't throw even i+1 > props.pageData.length
                newPageData.splice(i + 1, 0, frontendBlockData)
                break
            }
        }
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
    console.log("new page data after post: ", newPageData)

    // make call to db to insert block
    const backendBlockData = {
        afterUuid: insertAfterUuid,
        uuid: uuid,
        title: title,
        type: blockType.text,
        parent: parentUuid,
        newParentContent: newContent
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

const getBlockByUuid = (pageData, blockUuid) => {
    // return block, return null if not found
    let block = null;
    for(let i = 0; i < pageData.length; i++) {
        if (pageData[i].uuid === blockUuid) {
            block = pageData[i];
            break;
        }
    }
    return block
}


export {postBlock, getBlockIndex}
