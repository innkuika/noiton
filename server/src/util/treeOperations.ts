import {Block} from "../entity/Block";
const depthFirstTraversal = async (root: string, blockRepository) => {
    let blocks = []
    if (root === null) {
        return blocks
    }

    let queue: [string, number][] = []
    queue.push([root, 0])

    while (queue.length !== 0){
        // Dequeue an item from queue, query it and add it to blocks
        const uuidAndDepth: [string, number] = queue.shift()
        const uuid: string = uuidAndDepth[0]
        const depth: number = uuidAndDepth[1]
        const block: Block = await blockRepository.findOne(uuid, {relations: ["properties"]})
        block["depth"] = depth
        blocks.push(block)

        // Enqueue all children of the dequeued item
        const childDepth = depth + 1
        let subQueue: [string, number][] = []
        const content = block.content
        for (let i = 0; i < content.length; i++){
            subQueue.push([content[i], childDepth])
        }
        queue = subQueue.concat(queue)
    }
    return blocks
}

export {depthFirstTraversal}
