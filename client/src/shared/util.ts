const blockType = {
    page: "page",
    text: "text"
}

const quickTitle = (title: string): string => {
    return `{"blocks":[{"key":"fho3","text":"${title}","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}`
}

export {blockType, quickTitle}
