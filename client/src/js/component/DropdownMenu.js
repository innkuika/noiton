import "../../css/reset.css";
import "../../css/DropodownMenuStyle.css";
import { getBlockIndex } from "../util/blockOperation";
import { quickTitle } from "../../shared/util";

const DropdownMenu = (props) => {
  if (!props.show) {
    return null;
  }

  const options = [
    { name: "Heading 1", description: "Big section heading.", value: "type-h1", img: "h1-icon.png" },
    { name: "Heading 2", description: "Medium section heading.", value: "type-h2", img: "h2-icon.png" }
  ];

  return (
    <div className="dropdown-menu">
      {options.map((o, i) => {
        return <DropdownMenuItem
          key={i}
          name={o.name}
          description={o.description}
          img={o.img}
          value={o.value}
          setSelection={props.setSelection}
          setShowDropdown={props.setShowDropdown}
          pageData={props.pageData}
          setPageData={props.setPageData}
          uuid={props.uuid} />;
      })}
    </div>
  );
};

const DropdownMenuItem = (props) => {
  const onClick = (e) => {
    e.preventDefault();
    console.log(e.target.value);
    props.setShowDropdown(false);
    // update page data
    const index = getBlockIndex(props.pageData, props.uuid);
    let newPageData = [...props.pageData];
    let blockToUpdate = newPageData[index];
    blockToUpdate.type = props.value;
    blockToUpdate.title = quickTitle("")
    props.setPageData(newPageData);
    // clear content
    // mouse focus

    // make call to db
  };
  return (
    <div className="dropdown-option" onClick={onClick} value={props.value}>
      <span className="option-img">
        <img src={`img/${props.img}`} value={props.value} alt="option img" />
      </span>
      <span className="option-description">
        <div className="text-sm font-medium option-title" value={props.value}>{props.name}</div>
        <div className="text-xs font-light  option-detail" value={props.value}>{props.description}</div>
      </span>
    </div>
  );
};

export { DropdownMenu };
