import { changeOrder, addToSprint, removeFromSprint } from './apiService.js';
import { camelize } from './utils.js';



export const renderProductBacklog = (features, sprintsNamesObj) => {    
    const productBacklogList = features.filter((feature) => feature.version==='product backlog');    
    
    ej.grids.Grid.Inject(ej.grids.Selection, ej.grids.RowDD);    

    let productBacklog = new ej.grids.Grid(
        {
            dataSource: productBacklogList,
            allowRowDragAndDrop: true,
            selectionSettings: { type: 'Multiple' },
            rowDropSettings: { dropTargetID: [ ...Object.keys(sprintsNamesObj)] },
            width: '100%',
            columns: [
                { field: 'id', headerText: 'ID', isPrimaryKey: true, width: 80, textAlign: 'Left' },
                { field: 'type', headerText: 'Type', width: 130, textAlign: 'Left' },
                { field: 'title', headerText: 'Title', width: 130, textAlign: 'Left' },                
                { field: 'status', headerText: 'Status', width: 100, textAlign: 'Left' }, 
                { field: 'version', headerText: 'Version', width: 130, textAlign: 'Left' },
                { field: 'order', headerText: 'order', width: 170, textAlign: 'Left' },
            ],
            rowDrop: async function (args) {
                console.log('args', args);
                console.log('from', args.fromIndex);
                console.log('to', args.dropIndex);
                console.log('data', args.data[0]);
                const currentId = args.data[0].id;

                Object.keys(sprintsNamesObj).forEach(sprint => {
                    if (args.target.offsetParent.id.includes(sprint)) {
                        console.log('add to sprint', sprint)
                        const data = {
                            id: args.data[0].id,
                            version: sprintsNamesObj[sprint],
                        }
                        addToSprint(data);
                        return
                    }
                })
                

                if (args.fromIndex === args.dropIndex) {
                    console.log('equal');
                    return
                }


                if (args.fromIndex > args.dropIndex) {
                    console.log('move high');

                    let fetchData = [
                        { id: currentId, order: args.dropIndex },
                    ]

                    for (let i = args.fromIndex-1; i >= args.dropIndex; i = i-1) {
                        const feature = productBacklogList.find((feature) => feature.order === i);
                        const featureData = {
                            id: feature.id, 
                            order: i + 1,
                        }
                        fetchData.push(featureData);
                    }
                    changeOrder(fetchData);
                }


                if (args.fromIndex < args.dropIndex ) {
                    console.log('move low')

                    let fetchData = [
                        { id: currentId, order: args.dropIndex },
                    ]

                    for (let i = args.fromIndex+1; i <= args.dropIndex; i = i+1) {
                        const feature = await productBacklogList.find((feature) => feature.order === i);
                        console.log(feature)
                        const featureData = {
                            id: feature.id, 
                            order: i - 1,
                        }
                        fetchData.push(featureData);
                    }
                    changeOrder(fetchData);

                }
            }
        });

    productBacklog.appendTo('#productBacklog'); 
    return productBacklog;   
}



export const renderSprintBacklog = (features, sprintName, sprintsNamesObj) => {
    const sprintBacklogList = features.filter((feature) => feature.version === sprintName);
    const sprintNameInCamelCase = camelize(sprintName);

    const sprintsRoot = document.querySelector('#rootForSprintsBacklogs');
    
    sprintsRoot.insertAdjacentHTML('afterbegin', `
            <div sprint-backlog-wrap>
            <h3>${sprintName}</h3>
            <div id=${sprintNameInCamelCase}></div>
            </div>
        `);

    ej.grids.Grid.Inject(ej.grids.Selection, ej.grids.RowDD);
       

    const str = `
    
    const ${sprintNameInCamelCase} = new ej.grids.Grid(
        {
            dataSource: sprintBacklogList,
            header: 'TITLE',
            allowRowDragAndDrop: true,
            selectionSettings: { type: 'Multiple' },
            rowDropSettings: { dropTargetID: [ 'productBacklog', ...Object.keys(sprintsNamesObj).filter(name => name !== sprintNameInCamelCase) ] },
            width: '100%',
            columns: [
                { field: 'id', headerText: 'ID', isPrimaryKey: true, width: 80, textAlign: 'Left' },
                { field: 'type', headerText: 'Type', width: 130, textAlign: 'Left' },
                { field: 'title', headerText: 'Title', width: 130, textAlign: 'Left' },                
                { field: 'status', headerText: 'Status', width: 100, textAlign: 'Left' }, 
                { field: 'version', headerText: 'Version', width: 130, textAlign: 'Left' },
                { field: 'order', headerText: 'order', width: 170, textAlign: 'Left' },
            ],
            rowDrop: async function (args) {
                console.log('args', args);
                console.log('from', args.fromIndex);
                console.log('to', args.dropIndex);
                console.log('data', args.data[0]);
                const currentId = args.data[0].id;

                if (args.target.offsetParent.id.includes('productBacklog')) {
                    console.log('return to product backlog')
                    const data = {
                        id: currentId,
                        version: 'product backlog',
                    }
                    removeFromSprint(data);
                    return
                }

                Object.keys(sprintsNamesObj).forEach(sprint => {
                    if (sprint === sprintNameInCamelCase) return;

                    if (args.target.offsetParent.id.includes(sprint)) {
                        console.log('add to sprint', sprint)
                        const data = {
                            id: args.data[0].id,
                            version: sprintsNamesObj[sprint],
                        }
                        addToSprint(data);
                        return
                    }
                })
                
            }
        }); 
        
        ${sprintNameInCamelCase}.appendTo('#${sprintNameInCamelCase}');
    `

    eval(str)

}
