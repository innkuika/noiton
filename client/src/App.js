import './App.css';
import {useState} from "react";

function App() {
    const fakeDataArray = [
        {
            id: 0,
            properties: {
                title: "i'm the first block"
            },
        },
        {
            id: 1,
            properties: {
                title: "i'm the second block"
            },
        },
        {
            id: 2,
            properties: {
                title: "i'm the third block"
            },
        }
    ]
    return (
        <div className="App">
            <PageContent dataArray={fakeDataArray}/>
        </div>
    );
}


const PageContent = (props) => {
    const items = []
    for (const [index, value] of props.dataArray.entries()) {
        items.push(<Block key={index} data={value}/>)
    }
    return (<div>
        {items}
    </div>)
}

const Block = (props) => {
    const [value, setValue] = useState(props.data.properties.title);
    const onChange = event => {
        setValue(event.target.value)
    }
    return (
        <input type="text" id={props.id} value={value} onChange={onChange}/>
    )
}

export default App;
