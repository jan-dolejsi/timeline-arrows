/**
*CREATING THE TIMELINE 
*/
import { Arrows } from '../arrows.js';

const options = {
  groupOrder: "content", // groupOrder can be a property name or a sorting function
  selectable: true,
  editable: true,
  groupTemplate: function (group) { //function to hide groups
    const container = document.createElement('div');
    const label = document.createElement('span');
    label.innerHTML = group.content + ' ';
    container.insertAdjacentElement('afterBegin', label);

    const hide = document.createElement('span');
    hide.setAttribute("class", "oi oi-eye");
    hide.addEventListener('click', function () {
      groups.update({ id: group.id, visible: false });
    });
    container.insertAdjacentElement('beforeEnd', hide);
    return container;
  }
};

// Generate some
const now = vis.moment()
  .minutes(0)
  .seconds(0)
  .milliseconds(0);
const names = ["John", "Alston", "Lee", "Grant"];
const itemCount = 20;
// create a data set with groups
const groups = new vis.DataSet();
for (let g = 0; g < names.length; g++) {
  groups.add({ id: g, content: names[g] });
}
// create a dataset with items
const items = new vis.DataSet();
for (let i = 0; i < itemCount; i++) {
  const start = now.clone().add(Math.random() * 200, "hours");
  const end = start + 100000000;
  const group = Math.floor(Math.random() * names.length);
  items.add({
    id: i,
    group: group,
    content:
      "item " +
      i +
      ' <span style="color:#97B0F8;">(' +
      names[group] +
      ")</span>",
    start: start,
    end: end,
    //type: "box"
  });
}
// Create visualization.
const container = document.getElementById("visualization");
const timelinevis = new vis.Timeline(container, items, groups, options);


/**
*CREATING THE ARROWS 
*/
const dependency = [
  {
    id: 2,
    item1Id: 1,
    item2Id: 2,
    title: 'Hello'
  },
  {
    id: 5,
    item1Id: 3,
    item2Id: 5
  },
  {
    id: 7,
    item1Id: 6,
    item2Id: 7,
    title: 'Hola'
  },
  {
    id: 10,
    item1Id: 3,
    item2Id: 8
  }
];




// Create instance of Arrows for a timeline objetc and its denpedencies
const myArrows = new Arrows(timelinevis, dependency);



//Example of adding a new arrow (between items 15 and 16)
myArrows.addArrow(
  {
    id: 13,
    item1Id: 15,
    item2Id: 16,
    title: 'I have been added'
  }
);

/*ANOTHER FUNCTIONS (NO IMPORTANT)*/
document.getElementById("showVisibleItems").onclick = function () {
  const a = timelinevis.getVisibleItems();
  document.getElementById("visibleItemsContainer").innerHTML = ""
  document.getElementById("visibleItemsContainer").innerHTML += a;
};


document.getElementById("showGroups").onclick = function () {
  groups.forEach(function (group) {
    groups.update({ id: group.id, visible: true });
  })
};


document.getElementById("remove").onclick = function () {
  myArrows.removeArrow(10);
};
