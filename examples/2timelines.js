/**
*CREATING THE TIMELINE 1
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
*CREATING THE TIMELINE 2
*/

const options2 = {
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
      groups2.update({ id: group.id, visible: false });
    });
    container.insertAdjacentElement('beforeEnd', hide);
    return container;
  }
};

// Generate some
const now2 = vis.moment()
  .minutes(0)
  .seconds(0)
  .milliseconds(0);
const names2 = ["Juan", "Alfredo", "Luis", "David"];
const itemCount2 = 20;
// create a data set with groups
const groups2 = new vis.DataSet();
for (let g = 0; g < names2.length; g++) {
  groups2.add({ id: g, content: names2[g] });
}
// create a dataset with items
const items2 = new vis.DataSet();
for (let i = 0; i < itemCount2; i++) {
  const start = now2.clone().add(Math.random() * 200, "hours");
  const end = start + 100000000;
  const group = Math.floor(Math.random() * names2.length);
  items2.add({
    id: i,
    group: group,
    content:
      "item " +
      i +
      ' <span style="color:#97B0F8;">(' +
      names2[group] +
      ")</span>",
    start: start,
    end: end,
    //type: "box"
  });
}
// Create visualization.
const container2 = document.getElementById("visualization2");
const timelinevis2 = new vis.Timeline(container2, items2, groups2, options2);




/* SYNCHRONIZATION OF MOVEMENT OF BOTH TIMELINES */

timelinevis2.on('rangechange', function () {
  onrangechange2();
});
timelinevis.on('rangechange', function () {
  onrangechange1();
});
function onrangechange1() {
  const range = timelinevis.getWindow();
  timelinevis2.setWindow(range.start, range.end, { animation: false });
}
function onrangechange2() {
  const range = timelinevis2.getWindow();
  timelinevis.setWindow(range.start, range.end, { animation: false });
}



/**
*CREATING 2 ARRAYS OF ARROWS 
*/
const dependency = [
  {
    id: 2,
    item1Id: 1,
    item2Id: 2,
    title: 'Hola'
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
    title: 'Hello'
  },
  {
    id: 10,
    item1Id: 3,
    item2Id: 8
  }
];



const dependency2 = [
  {
    id: 2,
    item1Id: 1,
    item2Id: 2,
    title: 'Hola 2'
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
    title: 'Hello 2'
  },
  {
    id: 10,
    item1Id: 3,
    item2Id: 8
  }
];


// Create instance of Arrows for a timeline objetc and its denpedencies
const myArrows = new Arrows(timelinevis, dependency);

const myArrows2 = new Arrows(timelinevis2, dependency2);

//Example of adding a new arrow (between items 15 and 16)
myArrows.addArrow(
  {
    id: 13,
    item1Id: 15,
    item2Id: 16
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
  myArrows2.removeArrow(10);
}
