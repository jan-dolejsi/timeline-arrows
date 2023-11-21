/**
 * vis-timeline-arrows package is a fork of the timeline-arrows. 
 * The pull request is being ignored, hence this package was made to keep the good idea going.
 * I was originally proposing fairly cosmetic changes in the pull request, 
 * but since I decided to fork, let's turn this into a more JavaScript looking and feeling code.
 * I would be more than happy to get this code merged into the original repo 
 * and subsequently deprecating this npm package again.
 * 
 * Original package description:
 * 
 * timeline-arrows
 * https://github.com/javdome/timeline-arrows
 *
 * Class to easily draw lines to connect items in the vis Timeline module.
 *
 * @version 4.1.1
 * @date    2023-11-07
 *
 * @copyright (c) Javi Domenech (javdome@gmail.com) 
 *
 *
 * @license
 * timeline-arrows is dual licensed under both
 *
 *   1. The Apache 2.0 License
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *   and
 *
 *   2. The MIT License
 *      http://opensource.org/licenses/MIT
 *
 * timeline-arrows may be distributed under either license.
 */

// @ts-check

/**
 * @typedef {(number | string)} VisIdType Timeline view item id. Equivalent to vis.IdType.
 */

/**
 * @typedef {(number | string)} ArrowIdType arrow id.
 */

/**
 * @typedef ArrowSpec Arrow specification
 * @property {ArrowIdType} id arrow id
 * @property {VisIdType} item1Id start timeline item id
 * @property {VisIdType} item2Id end timeline item id
 * @property {string} [title] optional arrow title
 */

/**
 * @typedef ArrowOptions Arrow configuration options
 * @property {boolean} [followRelationships] if true, arrows can point backwards and will follow the relationships set in the data
 * @property {(el: SVGPathElement, title: string) => string } [tooltipConfig] if arrows have a `title` property, the default behavior will add a title attribute that shows on hover. However, you might not want to use the title attribute, but instead your own tooltip configuration.
        This method takes two arguments, `el` - the arrow - and `title` - the content of the `title` property set in the arrow data.
 * @property {string} [color] arrow color
 * @property {number} [strokeWidth] arrow thickness in pixels
 */


/**
 * @typedef VisItem timeline item
 * @property {VisIdType} group
 */

/**
 * @typedef Timeline Timeline object from vis-timeline
 * @property {{center: Element, container: {id: string}}} dom dom
 * @property {(event: "changed", callback: () => void) => void} on event handler
 * @property {{get: (id: VisIdType) => VisItem}} itemsData all items
 * @property {{get: (id: VisIdType) => any}} groupsData all groups
 * @property {{items: any}} itemSet item set
 * @property {() => [VisIdType]} getVisibleItems gets visible items
 * @property {()=>void} redraw triggers re-draw
 * @property {{orientation: {item: "bottom" | "top"}}} options options, see https://visjs.github.io/vis-timeline/docs/timeline/#Configuration_Options
 */

/** Arrow set for a vis.js Timeline. */
export class Arrows {

    /**
     * Creates arrows.
     * @param {Timeline} timeline timeline object
     * @param {ArrowSpec[]} dependencies arrows
     * @param {ArrowOptions} [options] options
     */
    constructor(timeline, dependencies, options) {
        this._svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this._timeline = timeline;

        /** @private @type {boolean | undefined} if true, arrows can point backwards and will follow the relationships set in the data */
        this._followRelationships = options?.followRelationships;
        /** @private @type {((el: SVGPathElement, title: string) => string) | undefined } */
        this._tooltipConfig = options?.tooltipConfig;

        /** @private @type {string} color */
        this._arrowsColor = options?.color ? options.color : "#9c0000"
        /** @private @type {number} arrow thickness in pixels */
        this._arrowsStrokeWidth = options?.strokeWidth ?? 3;

        /** @private @type {SVGMarkerElement} */
        this._arrowHead = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "marker"
        );
        /** @private @type {SVGPathElement} */
        this._arrowHeadPath = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
        );
        
        this._dependency = dependencies;

        /** @private @type {SVGPathElement[]} */
        this._dependencyPath = [];

        this._initialize();
    }
  
    _initialize() {
        //Configures the SVG layer and add it to timeline
        this._svg.style.position = "absolute";
        this._svg.style.top = "0px";
        this._svg.style.height = "100%";
        this._svg.style.width = "100%";
        this._svg.style.display = "block";
        this._svg.style.zIndex = "1"; // Should it be above or below? (1 for above, -1 for below)
        this._svg.style.pointerEvents = "none"; // To click through, if we decide to put it above other elements.
        this._timeline.dom.center.appendChild(this._svg);

        //Configure the arrowHead
        this._arrowHead.setAttribute("id", "arrowhead0");
        this._arrowHead.setAttribute("viewBox", "-10 -5 10 10");
        this._arrowHead.setAttribute("refX", "-7");
        this._arrowHead.setAttribute("refY", "0");
        this._arrowHead.setAttribute("markerUnits", "strokeWidth");
        this._arrowHead.setAttribute("markerWidth", "3");
        this._arrowHead.setAttribute("markerHeight", "3");
        this._arrowHead.setAttribute("orient", "auto-start-reverse");
        //Configure the path of the arrowHead (arrowHeadPath)
        this._arrowHeadPath.setAttribute("d", "M 0 0 L -10 -5 L -7.5 0 L -10 5 z");
        this._arrowHeadPath.style.fill = this._arrowsColor;
        this._arrowHead.appendChild(this._arrowHeadPath);
        this._svg.appendChild(this._arrowHead);
        //Create paths for the started dependency array
        for (const _element of this._dependency) {
            this._createPath();
        }
        
        //NOTE: We hijack the on "changed" event to draw the arrows.
        this._timeline.on("changed", () => {
            this._drawDependencies();
        });

    }
    
    /** @private */
    _createPath(){
        //Add a new path to array dependencyPath and to svg
        let somePath = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
          );
          somePath.setAttribute("d", "M 0 0");
          somePath.style.stroke = this._arrowsColor;
          somePath.style.strokeWidth = this._arrowsStrokeWidth + "px";
          somePath.style.fill = "none";
          somePath.style.pointerEvents = "auto";
          this._dependencyPath.push(somePath);
          this._svg.appendChild(somePath);
    }

    
    /** @private */
    _drawDependencies() {
        //Create paths for the started dependency array
        for (let i = 0; i < this._dependency.length; i++) {
            this._drawArrows(this._dependency[i], i);
        }
    }

    /**
     * @private 
     * @param {ArrowSpec} dep arrow specification
     * @param {number} index arrow index
     */
    _drawArrows(dep, index) {
        //Checks if both items exist
        //if( (typeof this._timeline.itemsData._data[dep.item1Id] !== "undefined") && (typeof this._timeline.itemsData._data[dep.item2Id] !== "undefined") ) {
        //debugger;
        const bothItemsExist = (this._timeline.itemsData.get(dep.item1Id) !== null) && (this._timeline.itemsData.get(dep.item2Id) !== null);
        
        //Checks if at least one item is visible in screen
        let oneItemVisible = false; //Iniciamos a false
        if (bothItemsExist) {    
            const visibleItems = this._timeline.getVisibleItems();
            for (const item of visibleItems) {
                if (dep.item1Id == item) oneItemVisible = true;
                if (dep.item2Id == item) oneItemVisible = true;
            }
        
            //Checks if the groups of items are both visible
            var groupOf_1_isVisible = false; //Iniciamos a false
            var groupOf_2_isVisible = false; //Iniciamos a false
            
            let groupOf_1 = this._timeline.itemsData.get(dep.item1Id).group; //let groupOf_1 = items.get(dep.item1Id).group;
            
            let groupOf_2 = this._timeline.itemsData.get(dep.item2Id).group; //let groupOf_2 = items.get(dep.item2Id).group;
                       
            if ( this._timeline.groupsData.get(groupOf_1) ) groupOf_1_isVisible = true;

            if ( this._timeline.groupsData.get(groupOf_2) ) groupOf_2_isVisible = true;


            // If groups are null then they are not visible.
            if (groupOf_1 == null){
                var groupOf_1_isVisible = false;
            }
            if (groupOf_2 == null){
                var groupOf_2_isVisible = false;
            }
        }

        if ( (groupOf_1_isVisible && groupOf_2_isVisible) && (oneItemVisible) && (bothItemsExist)) {
            let item_1 = this._getItemPos(this._timeline.itemSet.items[dep.item1Id]);
            let item_2 = this._getItemPos(this._timeline.itemSet.items[dep.item2Id]);

            if (!this._followRelationships && item_2.mid_x < item_1.mid_x) {
                [item_1, item_2] = [item_2, item_1]; // As demo, we put an arrow between item 0 and item1, from the one that is more on left to the one more on right.
            }

            const curveLen = item_1.height * 2; // Length of straight Bezier segment out of the item.

            if (this._followRelationships && item_2.mid_x < item_1.mid_x) {
                item_2.right += 10; // Space for the arrowhead.
                this._dependencyPath[index].setAttribute("marker-start", "url(#arrowhead0)");
                this._dependencyPath[index].setAttribute("marker-end", "");
                this._dependencyPath[index].setAttribute(
                    "d",
                    "M " +
                    item_2.right +
                    " " +
                    item_2.mid_y +
                    " C " +
                    (item_2.right + curveLen) +
                    " " +
                    item_2.mid_y +
                    " " +
                    (item_1.left - curveLen) +
                    " " +
                    item_1.mid_y +
                    " " +
                    item_1.left +
                    " " +
                    item_1.mid_y
                );
            } else {
                item_2.left -= 10; // Space for the arrowhead.
                this._dependencyPath[index].setAttribute("marker-end", "url(#arrowhead0)");
                this._dependencyPath[index].setAttribute("marker-start", "");
                this._dependencyPath[index].setAttribute(
                    "d",
                    "M " +
                    item_1.right +
                    " " +
                    item_1.mid_y +
                    " C " +
                    (item_1.right + curveLen) +
                    " " +
                    item_1.mid_y +
                    " " +
                    (item_2.left - curveLen) +
                    " " +
                    item_2.mid_y +
                    " " +
                    item_2.left +
                    " " +
                    item_2.mid_y
                );
            }

            // Adding the title if property title has been added in the dependency
            if (dep.hasOwnProperty("title")) {
                this._tooltipConfig
                    ? this._tooltipConfig(this._dependencyPath[index], dep.title ?? '')
                    : this._dependencyPath[index].innerHTML = "<title>" + dep.title + "</title>";
            }
        } else {
            this._dependencyPath[index].setAttribute("marker-end", "");
            this._dependencyPath[index].setAttribute("d", "M 0 0");
        }

    }

    /** @private Función que recibe in Item y devuelve la posición en pantalla del item. */
    _getItemPos (item) {
        let left_x = item.left;
        let top_y;
        if (this._timeline.options.orientation.item == "top") {
            top_y = item.parent.top + item.top;
        } else {
            top_y = item.parent.top + item.parent.height - item.top - item.height;
        }
        return {
            left: left_x,
            top: top_y,
            right: left_x + item.width,
            bottom: top_y + item.height,
            mid_x: left_x + item.width / 2,
            mid_y: top_y + item.height / 2,
            width: item.width,
            height: item.height
        }
    }


    /**
     * Adds arrow between two timeline items.
     * @param {ArrowSpec} dep item dependency
     */
    addArrow(dep) {
        this._dependency.push(dep);
        this._createPath();
        this._timeline.redraw();
    }

    /**
     * Get arrow by ID.
     * @param {ArrowIdType} id arrow ID
     * @returns {ArrowSpec | null} arrow spec, or null
     */
    getArrow(id) {
        return this._dependency.find(dep => dep.id === id) ?? null;
    }
    
    /**
     * Finds arrow with the given id and removes it.
     * Función que recibe el id de una flecha y la elimina.
     * @param {ArrowIdType} id arrow id
     */
    removeArrow(id) {
        const index = this._dependency.findIndex(dep => dep.id === id);

        if (index >= 0) {

            //var list = document.getElementsByTagName("path"); //FALTA QUE ESTA SELECCION LA HAGA PARA EL DOM DEL TIMELINE INSTANCIADO!!!!
            const list = document.querySelectorAll("#" + this._timeline.dom.container.id + " path");

            this._dependency.splice(index, 1); //Elimino del array dependency
            this._dependencyPath.splice(index, 1); //Elimino del array dependencyPath
        
            const parentNode = list[index + 1].parentNode; // may be null
            if (parentNode) {
                parentNode.removeChild(list[index + 1]); //Lo elimino del dom
            }
        }
    }

    /**
     * Finds all arrows related to one view item and removes them all.
     * Función que recibe el id de un item y elimina la flecha.
     * @param {VisIdType} id view item id
     * @returns {(ArrowIdType)[]} list of removed arrow ids
     */
    removeItemArrows(id) {
        let listOfRemovedArrows = [];
        for (let i = 0; i < this._dependency.length; i++) {
            if ( (this._dependency[i].item1Id == id) || (this._dependency[i].item2Id == id) ) {
                listOfRemovedArrows.push(this._dependency[i].id);
                this.removeArrow(this._dependency[i].id);
                i--;
            } 
        }
        return listOfRemovedArrows;
    }

    /**
     * For backward compatibility
     * @deprecated use the removeItemArrows method instead.
     */
    removeArrowbyItemId(id) {
        this.removeItemArrows(id);
    }

  }