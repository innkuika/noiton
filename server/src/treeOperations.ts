import {Block} from "./entity/Block";
const LevelOrderTraversal = async (root: string, blockRepository) => {
    let blocks = []
    if (root === null) {
        return blocks
    }

    // Standard level order traversal code using queue
    let queue = []
    queue.push(root)

    while (queue.length !== 0){
        let childrenNumber = queue.length
        // If this node has children
        while (childrenNumber > 0) {
            // Dequeue an item from queue, query it and add it to blocks
            const uuid: string = queue.shift()
            const block: Block = await blockRepository.findOne(uuid, {relations: ["properties"]})
            blocks.push(block)
            // Enqueue all children of the dequeued item
            const content = block.content
            for (let i = 0; i < content.length; i++){
                queue.push(content[i])
            }
            childrenNumber --
        }
    }
    return blocks
}

export {LevelOrderTraversal}
